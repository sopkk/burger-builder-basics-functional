import axios from "axios";
import * as actionTypes from "./actionTypes";

export const auth = (email, password, isSignup) => {
  return dispatch => {
    dispatch(authStart());
    const authData = {
      email: email,
      password: password,
      returnSecureToken: true
    };
    let url =
      "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBxNc90XJYJbJ1Gn6VIOUP3jP0-xSLWI-s";
    if (!isSignup) {
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBxNc90XJYJbJ1Gn6VIOUP3jP0-xSLWI-s";
    }
    axios
      .post(url, authData)
      .then(response => {
        console.log(response);
        const token = response.data.idToken;
        const expiresIn = response.data.expiresIn;
        const expirationDate = new Date(
          new Date().getTime() + expiresIn * 1000
        );
        localStorage.setItem("token", token);
        localStorage.setItem("expirationDate", expirationDate);
        const userId = response.data.localId;
        localStorage.setItem("userId", userId);
        dispatch(authSuccess(token, userId));
        dispatch(checkAuthTimeout(expiresIn));
      })
      .catch(error => {
        dispatch(authFailed(error.response.data.error));
      });
  };
};

export const authStart = () => {
  return {
    type: actionTypes.AUTH_START
  };
};

export const authSuccess = (token, userId) => {
  return {
    type: actionTypes.AUTH_SUCCESS,
    idToken: token,
    userId: userId
  };
};

export const authFailed = error => {
  return {
    type: actionTypes.AUTH_FAILED,
    error: error
  };
};

export const checkAuthTimeout = expirationTime => {
  return dispatch => {
    setTimeout(() => {
      dispatch(logout());
    }, expirationTime * 1000);
  };
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("expirationDate");
  localStorage.removeItem("userId");
  return {
    type: actionTypes.AUTH_LOGOUT
  };
};

export const setAuthRedirectPath = path => {
  return {
    type: actionTypes.SET_AUTH_REDIRECT_PATH,
    path: path
  };
};

export const authCheckState = () => {
  return dispatch => {
    const token = localStorage.getItem("token");
    if (!token) {
      dispatch(logout());
    } else {
      const expirationDate = new Date(localStorage.getItem("expirationDate"));
      if (expirationDate > new Date()) {
        const userId = localStorage.getItem("userId");
        dispatch(authSuccess(token, userId));
        dispatch(
          checkAuthTimeout(
            expirationDate.getTime() - new Date().getTime() / 1000
          )
        );
      } else {
        dispatch(logout());
      }
    }
  };
};
