import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import sessionReducer from './session';
import {  groupReducer } from './Groups';
import { groupIdReducer } from './Group';
import { eventReducer } from './events';
import eventIdReducer from './Event';

const rootReducer = combineReducers({
  session: sessionReducer,
  currGroup:groupIdReducer,
  currEvent:eventIdReducer,
  groups: groupReducer,
  events:eventReducer
});

let enhancer;
if (import.meta.env.MODE === "production") {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = (await import("redux-logger")).default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
