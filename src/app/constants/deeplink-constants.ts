import { routerPathStartWithSlash } from '@constants/router-constants';
import { environment } from '@environment/environment';
import { formUrlQueryParameters } from '@utils/global';

const DEEPLINK_ROUTES = [
  'emailVerify', 'deeplinkTenantLogin'
];

export const NO_AUTHENTICATION_NEED_ROUTES = [
  routerPathStartWithSlash('emailVerify'),
  routerPathStartWithSlash('deeplinkTenantLogin'),
];

export function deeplinkRoutes() {
  const deeplinkObj = {};
  DEEPLINK_ROUTES.forEach((item) => {
    const routePath = routerPathStartWithSlash(item);
    deeplinkObj[routePath] = null;
  });
  return deeplinkObj;
}

export function formShareUrl(pathName, context) {
  const routePath = routerPathStartWithSlash(pathName);
  const queryParams = formUrlQueryParameters(context);
  return `${environment.API_END_POINT}${routePath}?${queryParams}`;
}
