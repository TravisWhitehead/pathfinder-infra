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

const size = "t2.micro";     // t2.micro is available in the AWS free tier
const ami = aws.getAmiOutput({
    filters: [{
        name: "name",
        values: ["amzn-ami-hvm-*"],
    }],
    owners: ["137112412989"], // This owner ID is Amazon
    mostRecent: true,
});

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
