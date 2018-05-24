import * as React from "react";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";
import { State } from "../../reducers";
import { getTCR } from "../../helpers/civilInstance";
import { ViewModule, ViewModuleHeader } from "../utility/ViewModules";
import { connect, DispatchProp } from "react-redux";
import { addOrUpdateListingChallenge } from "../../actionCreators/listings";
import styled from "styled-components";

const StyledDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%
  color: black;
`;

export interface ChallengeHistoryProps {
  listing: string;
}

export interface ChallengeHistoryReduxProps {
  listingChallengesHistory: List<any>;
  listing: string;
}

export interface ChallengeHistoryState {
  error: undefined | string;
  compositeSubscription: Subscription;
}

class ChallengeHistory extends React.Component<DispatchProp<any> & ChallengeHistoryReduxProps, ChallengeHistoryState> {
  constructor(props: DispatchProp<any> & ChallengeHistoryReduxProps) {
    super(props);
    this.state = {
      compositeSubscription: new Subscription(),
      error: undefined,
    };
  }

  public async componentDidMount(): Promise<void> {
    return this.initHistory();
  }

  public componentWillUnmount(): void {
    this.state.compositeSubscription.unsubscribe();
  }

  public render(): JSX.Element {
    return (
      <ViewModule>
        <ViewModuleHeader>Challenge History</ViewModuleHeader>
        {this.props.listingChallengesHistory.map((e, i) => {
          return <ChallengeEvent key={i} challengeData={e} />;
        })}
      </ViewModule>
    );
  }

  private handleSubscriptionReturn = async (event: any) => {
    const timestamp = await event.timestamp();
    this.props.dispatch!(addOrUpdateListingChallenge(this.props.listing, { ...event, timestamp }));
  };

  // TODO(nickreynolds): move this all into redux
  private initHistory = async () => {
    const tcr = getTCR();

    if (tcr) {
      const listingHelper = tcr.getListing(this.props.listing);
      const subscription = Observable.merge(
        listingHelper.challenges(),
        listingHelper.failedChallenges(),
        listingHelper.successfulChallenges(),
      ).subscribe(this.handleSubscriptionReturn);
      this.setState({ compositeSubscription: subscription });
    }
  };
}

const mapToStateToProps = (state: State, ownProps: ChallengeHistoryProps): ChallengeHistoryReduxProps => {
  const { challenges, listingChallenges } = state;
  const listingChallengesIDs = listingChallenges.get(ownProps.listing) || List();
  const listingChallengesHistory = listingChallengesIDs
    .map((listingChallenge, i) => {
      return challenges.get(listingChallenge![0]);
    })
    .toList();
  return {
    ...ownProps,
    listingChallengesHistory,
  };
};

export interface ChallengeEventProps {
  challengeData: any;
}

class ChallengeEvent extends React.Component<DispatchProp<any> & ChallengeEventProps> {
  constructor(props: any) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <StyledDiv>
        <dl>
          <dt>Challenge Initiated</dt>
          <dd>{new Date(this.props.challengeData.challengeTimestamp * 1000).toUTCString()}</dd>
          <dt>Challenger</dt>
          <dd>{this.props.challengeData.challenger}</dd>
          {this.props.challengeData.challengeResolvedTimestamp && this.renderResolvedChallenge()}
        </dl>
      </StyledDiv>
    );
  }

  private renderResolvedChallenge = (): JSX.Element => {
    return (
      <>
        <dt>Resolved</dt>
        <dd>{new Date(this.props.challengeData.challengeResolvedTimestamp * 1000).toUTCString()}</dd>
        <dt>Succeeded</dt>
        <dd>{this.props.challengeData.isSucceeded ? "Yes" : "No"}</dd>
        <dt>Is Reward Available?</dt>
        <dd>
          {this.props.challengeData.isRewardAvailable
            ? "Congratulations! Claim your rewards"
            : "Sorry, you chose poorly"}
        </dd>
      </>
    );
  };
}

export default connect(mapToStateToProps)(ChallengeHistory);
