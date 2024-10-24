'use client'
import {useRef} from 'react'
import {Provider} from 'react-redux'
import store, {RootState} from '@/redux/store'
import {PersistGate} from "redux-persist/integration/react";
import {persistStore} from 'redux-persist';

export default function StoreProvider({children}: {
    children: React.ReactNode
}) {
    const storeRef = useRef<any>()
    if (!storeRef.current) {
        storeRef.current = store
    }
    const persistore = persistStore(store)
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistore}>
                {children}
            </PersistGate>
        </Provider>
    );
}