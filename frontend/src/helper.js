import _ from "lodash";
import { connect } from "react-redux";
import * as Actions from "../src/redux/reducer";
import axios from "axios";
import qs from "qs";
import { auth } from "./config/firebase";

const isDev = process.env.NODE_ENV === "development";

let baseUrl = process.env.NEXT_PUBLIC_BASEURL;

if (isDev) {
  baseUrl = process.env.NEXT_PUBLIC_BASEURL;
}

const axiosAPI = async (options) => {
  return axios(options)
    .then((res) => res.data)
    .catch((e) => {
      const err = _.get(e, "response.data");
      if (err) {
        if (err.status === 401) {
          console.error('Unauthorized:', err); 
          throw err;
        }
        throw err;
      }
      throw e;
    })
    .finally(() => {
      // setLoading && setLoading(false);
    });
};

// export const api = async (
//   path,
//   method = "get",
//   json = {},
//   setLoading,
//   moreOptions = {},
//   requireVerification = true
// ) => {
//   setLoading && setLoading(true);
//   const headers = {
//     "Content-Type": "application/json",
//   };

//   const options = {
//     method: method,
//     url: `${baseUrl}/api/${path}`,
//     headers,
//     paramsSerializer: qs.stringify,
//     onDownloadProgress: (progressEvent) => {
//       const progress = _.round(
//         (progressEvent.loaded / progressEvent.total) * 100,
//         2
//       );
//       setLoading && setLoading(`Downloading ${progress.toFixed(2)}%`);
//     },
//     onUploadProgress: (progressEvent) => {
//       const progress = _.round(
//         (progressEvent.loaded * 100) / progressEvent.total,
//         2
//       );
//       setLoading && setLoading(`${progress}%`);
//     },
//     ...moreOptions,
//   };
//   if (method.toLowerCase() === "get") {
//     options.params = json;
//   } else {
//     options.data = json;
//   }

//   if (requireVerification) {
//     if (!_.isEmpty(auth.currentUser)) {
//       const token = (await auth.currentUser?.getIdTokenResult(true))?.token;
//       if (!_.isEmpty(token)) {
//         console.log('Sending request:', { url: options.url, method, headers: { ...headers, Authorization: `Bearer ${token}` } });
//         _.set(options, "headers.Authorization", `Bearer ${token}`); 
//         return axiosAPI(options);
//       } else {
//         throw new Error('No token available');
//       }
//     } else {
//       throw new Error('No authenticated user');
//     }
//   } else {
//     return axiosAPI(options);
//   }
// };

// Rest of the file remains unchanged

export const api = async (
  path,
  method = "get",
  json = {},
  setLoading,
  moreOptions = {},
  requireVerification = true
) => {
  setLoading && setLoading(true);
  const headers = {
    "Content-Type": "application/json",
  };

  const options = {
    method: method,
    url: `${baseUrl}/api/${path}`,
    headers,
    paramsSerializer: qs.stringify,
    onDownloadProgress: (progressEvent) => {
      const progress = _.round(
        (progressEvent.loaded / progressEvent.total) * 100,
        2
      );
      setLoading && setLoading(`Downloading ${progress.toFixed(2)}%`);
    },
    onUploadProgress: (progressEvent) => {
      const progress = _.round(
        (progressEvent.loaded * 100) / progressEvent.total,
        2
      );
      setLoading && setLoading(`${progress}%`);
    },
    ...moreOptions,
  };
  if (method.toLowerCase() === "get") {
    options.params = json;
  } else {
    options.data = json;
  }

  if (requireVerification) {
    const currentUser = await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });

    if (!currentUser) {
      setLoading && setLoading(false);
      throw new Error('No authenticated user');
    }

    const token = (await currentUser.getIdTokenResult(true))?.token;
    if (!token) {
      setLoading && setLoading(false);
      throw new Error('No token available');
    }

    console.log('Sending request:', { url: options.url, method, headers: { ...headers, Authorization: `Bearer ${token}` } });
    _.set(options, "headers.Authorization", `Bearer ${token}`);
    return axiosAPI(options).finally(() => setLoading && setLoading(false));
  } else {
    return axiosAPI(options).finally(() => setLoading && setLoading(false));
  }
};

export const getReduxProps = (list) => (states) => {
  let props = {};
  _.forEach(list, (name) => {
    _.set(props, name, states[name]);
  });
  return props;
};

export const getReduxActions = (list) => {
  let props = {};
  _.forEach(list, (name) => {
    _.set(props, name, Actions[name]);
  });
  return props;
};

export const redux =
  (props, actions, forwardRef = false) =>
  (Component) => {
    return connect(getReduxProps(props), getReduxActions(actions), null, {
      forwardRef,
    })(Component);
  };
