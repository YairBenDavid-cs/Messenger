import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../../common/database/database.module';
import { CreateUserHandler } from './application/commands/create-user.command';
import { FindUserByIdHandler } from './application/queries/find-user-by-id.query';
import { FindUsersByIdsHandler } from './application/queries/find-users-by-ids.query';
import { ListUsersHandler } from './application/queries/list-users.query';
import { VerifyCredentialsHandler } from './application/queries/verify-credentials.query';
import { PasswordService } from './application/password.service';
import { USER_REPOSITORY } from './domain/user.repository';
import { UserMongoRepository } from './model/user.mongo.repository';
import { UserModel, UserSchema } from './model/user.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  providers: [
    PasswordService,
    { provide: USER_REPOSITORY, useClass: UserMongoRepository },
    FindUserByIdHandler,
    FindUsersByIdsHandler,
    ListUsersHandler,
    VerifyCredentialsHandler,
    CreateUserHandler,
  ],
})
export class UsersModule {}
