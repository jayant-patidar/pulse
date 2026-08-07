import { Module, Global, forwardRef } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { MembershipsModule } from '../memberships/memberships.module';

@Global()
@Module({
  imports: [forwardRef(() => MembershipsModule)],
  providers: [RbacService],
  exports: [RbacService],
})
export class RbacModule {}
