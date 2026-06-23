import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../../common/database/database.module';
import { FindUserByIdHandler, UsersService } from './application/users.service';
import { USER_REPOSITORY } from './domain/user.repository';
import { UserMongoRepository } from './model/user.mongo.repository';
import { UserModel, UserSchema } from './model/user.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  providers: [UsersService, { provide: USER_REPOSITORY, useClass: UserMongoRepository }, FindUserByIdHandler],
  exports: [UsersService],
})
export class UsersModule {}
