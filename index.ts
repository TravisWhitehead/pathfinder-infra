import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as mysql from "@pulumi/mysql";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const dbUser = config.require("dbUser");
const dbPassword = config.require("dbPassword");
const env = config.require("env");

const dbPasswordSecret = new aws.secretsmanager.Secret(`db_password_secret_${env}`);
new aws.secretsmanager.SecretVersion(`db_password_secret_version_${env}`, {
    secretId: dbPasswordSecret.id,
    secretString: dbPassword
});

const rds = new aws.rds.Instance("db", {
  engine: "mariadb",
  username: dbUser,
  password: dbPassword,
  availabilityZone: "us-west-2c",
  instanceClass: "db.t2.micro",
  allocatedStorage: 10,
  deletionProtection: true,
});

const dbProvider = new mysql.Provider("db", {
  endpoint: rds.endpoint,
  username: rds.username,
  password: dbPassword,
});

const keypair_name = "pulumi_key";    // Corresponds to keypair.yml playbook
const image_name = "ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-20211129";
const image_owner = "099720109477";
const size = "t2.micro";

const ami = pulumi.output(aws.ec2.getAmi({
    filters: [{
        name: "name",
        values: [image_name],
    }],
    owners: [image_owner]
}));

const security_group = new aws.ec2.SecurityGroup("web-sg", {
    ingress: [
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 443, toPort: 443, cidrBlocks: ["0.0.0.0/0"] },
    ],
    egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
});

const web = new aws.ec2.Instance("web", {
    instanceType: size,
    keyName: keypair_name,
    vpcSecurityGroupIds: [ security_group.id ],
    ami: ami.id,
});

export const dbEndpoint = rds.endpoint;
export const publicIp = web.publicIp;
export const publicHostName = web.publicDns;
