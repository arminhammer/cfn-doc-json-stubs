'use strict';

const path = require('path');
const fs = require('fs-extra');
const index = require('../index');

describe('Index file has the right values', () => {
  test('S3 has the right values:', () => {
    expect(Object.keys(index.S3.Resources).sort()).toEqual(
      ['Bucket', 'BucketPolicy'].sort()
    );
    expect(Object.keys(index.S3.Models).length).toEqual(27);
  });

  test('EC2 has the right values:', () => {
    expect(Object.keys(index.EC2.Resources).sort()).toEqual(
      [
        'Volume',
        'VolumeAttachment',
        'EIPAssociation',
        'EIP',
        'Instance',
        'SecurityGroupIngress',
        'SecurityGroup',
        'CustomerGateway',
        'DHCPOptions',
        'EgressOnlyInternetGateway',
        'FlowLog',
        'Host',
        'InternetGateway',
        'NatGateway',
        'NetworkAclEntry',
        'NetworkAcl',
        'NetworkInterfaceAttachment',
        'NetworkInterface',
        'PlacementGroup',
        'NetworkInterfacePermission',
        'RouteTable',
        'Route',
        'SpotFleet',
        'SecurityGroupEgress',
        'SubnetNetworkAclAssociation',
        'SubnetRouteTableAssociation',
        'Subnet',
        'SubnetCidrBlock',
        'VPCDHCPOptionsAssociation',
        'VPCGatewayAttachment',
        'VPCCidrBlock',
        'VPC',
        'VPCEndpoint',
        'VPCPeeringConnection',
        'VPNConnectionRoute',
        'VPNConnection',
        'VPNGateway',
        'VPNGatewayRoutePropagation'
      ].sort()
    );
    expect(Object.keys(index.EC2.Models).length).toEqual(22);
  });

  test('DDB has the right values:', () => {
    expect(Object.keys(index.DynamoDB.Resources).sort()).toEqual(
      ['Table'].sort()
    );
    expect(Object.keys(index.DynamoDB.Models).length).toEqual(9);
  });
});
