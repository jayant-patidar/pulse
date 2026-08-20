import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationsModule } from '../organizations/organizations.module';
import { RbacModule } from '../rbac/rbac.module';
import { UsersModule } from '../users/users.module';
import { MembershipsController } from './memberships.controller';
import { MembershipDocument, MembershipSchema } from './memberships.schema';
import { MembershipsService } from './memberships.service';

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
