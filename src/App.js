import React, { Component } from "react";
import { BrowserRouter as Router, withRouter } from "react-router-dom";
import { Provider } from "react-redux";
import throttle from "lodash/throttle";
import configureStore from "./configureStore";
import { Subreddit } from "./components/snew";
import HeaderAlert from "./components/HeaderAlert";
import Routes from "./Routes";
import * as pki from "./lib/pki";
import loaderConnector from "./connectors/loader";
import { handleSaveTextEditorsContent } from "./lib/editors_content_backup";
import { handleSaveStateToLocalStorage } from "./lib/local_storage";
import { onLocalStorageChange } from "./actions/app";
import ModalStack from "./components/Modal/ModalStack";

const store = configureStore();

store.subscribe(throttle(() => {
  const state = store.getState();
  handleSaveTextEditorsContent(state);
  handleSaveStateToLocalStorage(state);
}, 1000));

const createStorageListener = store => event => store.dispatch(onLocalStorageChange(event));

class Loader extends Component {
  componentWillMount() {
    this.props.onInit();
  }

  verifyUserPubkey = (email, keyToBeMatched) =>
    pki
      .getKeys(email)
      .then(keys =>
        this.props.keyMismatchAction(
          keys.publicKey !== keyToBeMatched
        )
      );

  componentWillReceiveProps(nextProps) {
    if (nextProps.loggedInAsEmail) {
      this.verifyUserPubkey(nextProps.loggedInAsEmail, nextProps.userPubkey);
    }
  }

  componentDidMount() {
    this.storageListener = createStorageListener(store);
    window.addEventListener("storage", this.storageListener);
    if (this.props.loggedInAsEmail) {
      this.verifyUserPubkey(this.props.loggedInAsEmail, this.props.userPubkey);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("storage", this.storageListener);
  }

  render() {
    return (
      <Router>
        <div className="appWrapper">
          <ModalStack />
          {this.props.children}
        </div>
      </Router>
    );
  }
}

const LoaderComponent = loaderConnector(Loader);

const HeaderAlertComponent = withRouter(
  loaderConnector(
    ({ location, loggedInAsEmail, userCanExecuteActions, history }) => {
      if (!loggedInAsEmail) return null;
      if (!userCanExecuteActions && location.pathname !== "/user/account") {
        return (
          <HeaderAlert className="action-needed-alert">
						You cannot currently submit proposals or comments, please visit your{" "}
            <a
              style={{ cursor: "pointer" }}
              onClick={() => history.push("/user/account")}
            >
							account page
            </a>{" "}
						to correct this problem.
          </HeaderAlert>
        );
      }
      return null;
    }
  )
);

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <LoaderComponent>
          <HeaderAlertComponent />
          <Subreddit>
            <Routes />
          </Subreddit>
        </LoaderComponent>
      </Provider>
    );
  }
}
