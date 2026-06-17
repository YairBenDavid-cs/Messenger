import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import type { User } from '../domain/user.entity';
import type { CreateUserData, UserRepository } from '../domain/user.repository';
import { UserMapper } from './user.mapper';
import { UserDocument, UserModel } from './user.schema';

@Injectable()
export class UserMongoRepository implements UserRepository {
  constructor(@InjectModel(UserModel.name) private readonly model: Model<UserDocument>) {}

  async findById(id: string): Promise<User | null> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const doc = await this.model.findById(id).exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }

  async findByIds(ids: string[]): Promise<User[]> {
    const validIds = ids.filter((id) => isValidObjectId(id));
    if (validIds.length === 0) {
      return [];
    }
    const docs = await this.model.find({ _id: { $in: validIds } }).exec();
    return docs.map((doc) => UserMapper.toDomain(doc));
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.model.findOne({ email: email.trim().toLowerCase() }).exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }

  async findAll(): Promise<User[]> {
    const docs = await this.model.find().exec();
    return docs.map((doc) => UserMapper.toDomain(doc));
  }

  async create(data: CreateUserData): Promise<User> {
    const doc = await this.model.create(data);
    return UserMapper.toDomain(doc);
  }
}
