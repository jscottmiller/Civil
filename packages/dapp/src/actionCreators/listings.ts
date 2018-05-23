// import { Action, AnyAction, ActionCreator } from "redux";
import { AnyAction } from "redux";
import { Dispatch } from "react-redux";
// import { ThunkAction } from "redux-thunk";
import { ListingWrapper, TimestampedEvent } from "@joincivil/core";
import { hasClaimedTokens } from "../apis/civilTCR";

export enum listingActions {
  ADD_OR_UPDATE_LISTING_CHALLENGE = "ADD_OR_UPDATE_LISTING_CHALLENGE",
  ADD_OR_UPDATE_LISTING = "ADD_OR_UPDATE_LISTING",
  ADD_HISTORY_EVENT = "ADD_HISTORY_EVENT",
  ADD_REWARDS_STATUS = "ADD_REWARDS_STATUS",
}

export const addListing = (listing: ListingWrapper): AnyAction => {
  return {
    type: listingActions.ADD_OR_UPDATE_LISTING,
    data: listing,
  };
};

export const addHistoryEvent = (address: string, event: TimestampedEvent<any>): AnyAction => {
  return {
    type: listingActions.ADD_HISTORY_EVENT,
    data: {
      address,
      event,
    },
  };
};

/*
export const addOrUpdateListingChallenge = (address: string, event: TimestampedEvent<any>): AnyAction => {
  return {
    type: listingActions.ADD_OR_UPDATE_LISTING_CHALLENGE,
    data: {
      address,
      event,
    },
  };
};
//*/

/*
export const addOrUpdateListingChallenge: ActionCreator<ThunkAction<Promise<AnyAction>, any, void>> = (address: string, e: TimestampedEvent<any>) => {
  return async (dispatch: Dispatch<any>, getState: any): Promise<AnyAction> => {
    const tcr = getTCR();
    const challengeID = e.args.challengeID;
    const challengeResult = (e.event === "_ChallengeFailed") ? "Failed" :
      (e.event === "_ChallengeSucceeded") ? "Succeeded" : "Unknown";
    const isRewardAvailable = await tcr.hasClaimedTokens(challengeID);
    return dispatch({
      type: listingActions.ADD_OR_UPDATE_LISTING_CHALLENGE,
      data: {
        event: e,
        challengeID,
        result: challengeResult,
        isRewardAvailable,
      }
    });
  }
}
//*/
// export const addOrUpdateListingChallenge: ActionCreator<ThunkAction<Promise<Action>, any, void>> = (address: string, e: TimestampedEvent<any>) => {
export const addOrUpdateListingChallenge = (address: string, e: TimestampedEvent<any>): any => {
  return async (dispatch: Dispatch<any>, getState: any): Promise<AnyAction> => {
    const challengeID = e.args.challengeID;
    const challengeResult = (e.event === "_ChallengeFailed") ? "Failed" :
      (e.event === "_ChallengeSucceeded") ? "Succeeded" : "Unknown";
    const isRewardAvailable = !!challengeID ? await hasClaimedTokens(challengeID) : false;
    return dispatch({
      type: listingActions.ADD_OR_UPDATE_LISTING_CHALLENGE,
      data: {
        address,
        event: e,
        challengeID,
        result: challengeResult,
        isRewardAvailable,
      }
    });
  }
}
