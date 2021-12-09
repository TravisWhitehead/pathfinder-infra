import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
// import * as mysql from '@pulumi/mysql';
import * as pulumi from "@pulumi/pulumi";

/*
const config = new pulumi.Config();
const dbUser = config.require('dbUser');
const dbPassword = config.requireSecret('dbPassword');

const rds = new aws.rds.Instance('db', {
  engine: 'mysql',
  username: dbUser,
  password: dbPassword,
  availabilityZone: 'us-west-2',
  instanceClass: 'db.t2.micro',
  allocatedStorage: 20,
  deletionProtection: true,

  // For a VPC cluster, you will also need the following:
  // dbSubnetGroupName: 'sg-db01-replication-1',
  // vpcSecurityGroupIds: ['sg-c1c63aba'],
});

const dbProvider = new mysql.Provider('db', {
  endpoint: rds.endpoint,
  username: rds.username,
  password: rds.password,
});

const database = new mysql.Database('pathfinder', {
  name: 'pathfinder',
}, {
  provider: dbProvider
});
*/

const image_name = 'ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-20211129';
const image_owner = '099720109477';
const size = "t2.micro";

const ami = pulumi.output(aws.ec2.getAmi({
    filters: [{
        name: "name",
        values: [image_name],
    }],
    owners: [image_owner]
}));

const group = new aws.ec2.SecurityGroup("webserver-secgrp", {
    ingress: [
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
    ],
});

const web = new aws.ec2.Instance("web", {
    instanceType: size,
    vpcSecurityGroupIds: [ group.id ],
    ami: ami.id,
});

export const publicIp = web.publicIp;
export const publicHostName = web.publicDns;
