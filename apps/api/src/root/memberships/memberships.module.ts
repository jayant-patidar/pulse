import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembershipDocument, MembershipSchema } from './memberships.schema';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { RbacModule } from '../rbac/rbac.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MembershipDocument.name, schema: MembershipSchema }]),
    OrganizationsModule,
    UsersModule,
    forwardRef(() => RbacModule),
  ],
  controllers: [MembershipsController],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
