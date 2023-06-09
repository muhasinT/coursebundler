import {configureStore} from "@reduxjs/toolkit";
import { profileReducer, subscriptionReducer, userReducer } from "./reducers/userReducer";
import { courseReducer } from "./reducers/courseReducer";
import { adminReducer } from "./reducers/adminReducers";
import { otherReducer } from "./reducers/otherReducers";


const store = configureStore({
    reducer:{
        user: userReducer,
        profile: profileReducer,
        course: courseReducer,
        subscription: subscriptionReducer,
        admin : adminReducer,
        other:otherReducer,
    },
});

export default store;

// export const server =  'http://localhost:4000/api/v1';

export const server =  'http://65.0.26.192:4000/api/v1';
