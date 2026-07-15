import { SetMetadata } from '@nestjs/common';
import { SKIP_AUTHORIZATION_KEY } from './auth.constants';

export const SkipAuthorization = () =>
  SetMetadata(SKIP_AUTHORIZATION_KEY, true);
