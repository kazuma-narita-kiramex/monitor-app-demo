#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkStack } from '../lib/cdk-stack';

const app = new cdk.App();
new CdkStack(app, 'CdkStack');

cdk.Tag.add(app, 'Group', 'narita');
cdk.Tag.add(app, 'CmBillingGroup', 'narita');
