import * as protoLoader from '@grpc/proto-loader';
import * as gRPC from '@grpc/grpc-js';
import * as _ from 'lodash';

export default (
  packageName: string,
  serviceName: string,
  protoPath: string,
  address: string
): any => {
  const packageDef = protoLoader.loadSync(protoPath);
  const pkg = gRPC.loadPackageDefinition(packageDef);
  const service = _.get(pkg, packageName);

  return new service[serviceName](address, gRPC.credentials.createInsecure());
};
