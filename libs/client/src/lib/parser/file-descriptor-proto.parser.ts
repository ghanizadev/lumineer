import {
  FileDescriptorProto,
  IFileDescriptorProto,
  IDescriptorProto,
  IEnumDescriptorProto,
  IServiceDescriptorProto,
} from 'protobufjs/ext/descriptor';
import * as fs from 'node:fs';

export class FileDescriptorProtoParser {
  private readonly fileDescriptor: IFileDescriptorProto;

  private protoText = '';

  constructor(private readonly fileBuffer: Buffer) {
    this.fileDescriptor = FileDescriptorProto.decode(
      fileBuffer
    ) as IFileDescriptorProto;

    //hack
    this.fileDescriptor = JSON.parse(JSON.stringify(this.fileDescriptor));
  }

  public saveToFile(path: string) {
    this.toText();
    fs.writeFileSync(path + '.proto', this.protoText);
    fs.writeFileSync(
      path + '.json',
      JSON.stringify(this.fileDescriptor, null, 2)
    );
  }

  public toText() {
    this.protoText += 'syntax = "proto3";\n\n';

    if (this.fileDescriptor.package) {
      this.protoText += `package ${this.fileDescriptor.package};\n\n`;
    }

    if (this.fileDescriptor.dependency) {
      this.fileDescriptor.dependency.forEach((dep: string) => {
        this.protoText += `import "${dep}";\n`;
      });
      this.protoText += '\n';
    }

    if (this.fileDescriptor.messageType) {
      this.fileDescriptor.messageType.forEach((messageType) => {
        this.protoText += this.generateMessageText(messageType);
      });
    }

    if (this.fileDescriptor.enumType) {
      this.fileDescriptor.enumType.forEach((enumType) => {
        this.protoText += this.generateEnumText(enumType);
      });
    }

    if (this.fileDescriptor.service) {
      this.fileDescriptor.service.forEach((serviceType) => {
        this.protoText += this.generateServiceText(serviceType);
      });
    }

    return this.protoText;
  }

  private generateMessageText(messageType: IDescriptorProto) {
    let messageText = `message ${messageType.name} {\n`;

    messageType.field.forEach((field) => {
      messageText += `  ${this.generateFieldLabel(
        field.label
      )}${this.generateFieldType(field.type)} ${field.name} = ${
        field.number
      };\n`;
    });

    messageText += '}\n\n';
    return messageText;
  }

  get filename() {
    return this.fileDescriptor.name;
  }

  private generateFieldLabel(label: string | number) {
    switch (label) {
      case 'LABEL_OPTIONAL':
        return label.replace('LABEL_', '').toLowerCase() + ' ';
      default:
        return '';
    }
  }

  private generateFieldType(type: string | number) {
    switch (type) {
      case 'TYPE_STRING':
      case 'TYPE_INT32':
        return type.replace('TYPE_', '').toLowerCase() + ' ';
      default:
        return '';
    }
  }

  private generateEnumText(enumType: IEnumDescriptorProto) {
    let enumText = `enum ${enumType.name} {\n`;

    enumType.value.forEach((value) => {
      enumText += `  ${value.name} = ${value.number};\n`;
    });

    enumText += '}\n\n';
    return enumText;
  }

  private generateServiceText(serviceType: IServiceDescriptorProto) {
    let serviceText = `service ${serviceType.name} {\n`;

    serviceType.method.forEach((method) => {
      serviceText += `  rpc ${method.name} (${
        method.serverStreaming ? 'stream ' : ''
      }${method.inputType}) returns (${
        method.clientStreaming ? 'stream ' : ''
      }${method.outputType});\n`;
    });

    serviceText += '}\n\n';
    return serviceText;
  }
}
