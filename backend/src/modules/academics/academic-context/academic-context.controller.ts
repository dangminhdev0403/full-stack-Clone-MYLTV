import { Controller, Get } from '@nestjs/common';
import { RequirePermission } from '../../../common/auth/require-permission.decorator';
import { RequireRole } from '../../../common/auth/require-role.decorator';
import { AcademicContextService } from './academic-context.service';

@Controller('api/v1/admin/academic-context')
@RequireRole('admin', 'super_admin')
export class AcademicContextController {
  constructor(private readonly academicContext: AcademicContextService) {}

  @Get('current')
  @RequirePermission('academics.context.read')
  getCurrent() {
    return this.academicContext.getCurrentContext();
  }
}
