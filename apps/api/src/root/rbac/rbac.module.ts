import { Global, Module, forwardRef } from '@nestjs/common';
import { MembershipsModule } from '../memberships/memberships.module';
import { RbacService } from './rbac.service';

@Global()
@Module({
  imports: [forwardRef(() => MembershipsModule)],
  providers: [RbacService],
  exports: [RbacService],
})
export class RbacModule {}
