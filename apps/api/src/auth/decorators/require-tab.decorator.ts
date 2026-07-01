import { SetMetadata } from '@nestjs/common';

export const REQUIRE_TAB_KEY = 'require_tab';

/** Gate a route by a tab bit (see TAB in @erp/types). Enforced by TabGuard. */
export const RequireTab = (bit: number) => SetMetadata(REQUIRE_TAB_KEY, bit);
