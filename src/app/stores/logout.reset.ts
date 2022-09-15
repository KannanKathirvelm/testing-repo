import { Action } from '@ngrx/store';

export class ActionTypes {
  public static LOGOUT = '[App] logout';
}

export class Logout implements Action {
  public readonly type = ActionTypes.LOGOUT;
}

/**
 * @function clearState
 * This Method is used to logout reducer
 */
export function clearState(reducer) {
  const logout = (state, action) => {
    if (action.type === ActionTypes.LOGOUT) {
      state = undefined;
    }
    return reducer(state, action);
  };
  return logout;
}
