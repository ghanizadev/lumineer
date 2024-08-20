export type RpcScalar =
  | 'unknown'
  | 'double'
  | 'float'
  | 'int64'
  | 'uint64'
  | 'int32'
  | 'fixed64'
  | 'fixed32'
  | 'bool'
  | 'string'
  | 'group' //TODO: implement
  | 'message'
  | 'bytes'
  | 'uint32'
  | 'enum'
  | 'sfixed32'
  | 'sfixed64'
  | 'sint32'
  | 'sint64';

export type RpcMessageType = {
  typeName: string;
  type: 'message' | 'enum' | 'oneof';
  properties: Record<string, RpcProperty>;
  messages: RpcMessageType[];
};

export type RpcProperty = {
  propertyName: string;
  type?: RpcScalar;
  optional?: boolean;
  repeated?: boolean;
  map?: RpcScalar[];
  ref?: string;
};

export type RpcMetadata = {
  rpcName: string;
  clientStream?: boolean;
  serverStream?: boolean;
  argumentTypeName?: string;
  returnTypeName?: string;
};
