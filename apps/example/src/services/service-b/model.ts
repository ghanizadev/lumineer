import { Entity, ObjectId, ObjectIdColumn, Column } from 'typeorm';

@Entity()
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  unique: string;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;
}
