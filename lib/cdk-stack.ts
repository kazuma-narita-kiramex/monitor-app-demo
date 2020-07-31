import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecr from '@aws-cdk/aws-ecr';
import * as ecs from '@aws-cdk/aws-ecs';
import * as log from '@aws-cdk/aws-logs';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 既存のVPCをインポート
    const vpc = ec2.Vpc.fromVpcAttributes(this, 'VPC', {
      vpcId: this.node.tryGetContext('vpcId'),
      availabilityZones: this.node.tryGetContext('availabilityZones'),
      publicSubnetIds: this.node.tryGetContext('publicSubnetIds'),
    });

    // 既存のTGをインポート
    const targetGroup = elbv2.ApplicationTargetGroup.fromTargetGroupAttributes(this, 'TG', {
      targetGroupArn: this.node.tryGetContext('targetGroupArn')
    });

    // ECRレポジトリ作成
    const repository = new ecr.Repository(this, 'Repository', {
      repositoryName: 'narita-monitor-app-demo',
      lifecycleRules: [
        { maxImageCount: 10 }
      ]
    });

    const table = new dynamodb.Table(this, 'Table', {
      partitionKey: { name: 'roomId', type: dynamodb.AttributeType.STRING },
    });

    // ECS Fargate
    // imageTagが与えられた場合のみ、ECSサービスをデプロイする
    if (this.node.tryGetContext('imageTag')) {

    // Fargate ServiceにアタッチするSG
    const sg = new ec2.SecurityGroup(this, 'SG', {
      vpc
    });
    sg.addIngressRule(ec2.Peer.ipv4('0.0.0.0/0'), ec2.Port.tcp(80));

    const cluster = new ecs.Cluster(this, 'Cluster', {
        vpc,
      });

      const fargateTaskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
        memoryLimitMiB: 512,
        cpu: 256
      });

      const container = fargateTaskDefinition.addContainer("AppContainer", {
        image: ecs.ContainerImage.fromEcrRepository(repository, this.node.tryGetContext('imageTag')),
        logging: ecs.LogDrivers.awsLogs({
          streamPrefix: 'narita-monitor-app-demo',
          logRetention: log.RetentionDays.ONE_WEEK,
        }),
      });

      container.addPortMappings({
        containerPort: 80,
        hostPort: 80
      })

      const service = new ecs.FargateService(this, 'Service', {
        cluster,
        taskDefinition: fargateTaskDefinition,
        desiredCount: 1,
        assignPublicIp: true,
        securityGroup: sg,
      });

      service.attachToApplicationTargetGroup(targetGroup);
    }

  }
}
