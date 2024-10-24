import { Reducer, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { createWrapper } from "next-redux-wrapper";
import storage from 'redux-persist/lib/storage'
import rootReducer from "./reducer/rootReducer";

const persistConfig = {
    key: 'root',
    storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
    reducer: persistedReducer,
    devTools: true,
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'persist/PERSIST',
                    'persist/REHYDRATE',
                ],
            },
        }),
})




export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export const wrapper = createWrapper(() => store)

export default store
