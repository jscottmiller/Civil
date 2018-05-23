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
  listingChallengeHistory: List<any>;
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

  public componentWillReceiveProps(newProps: any): void {
    console.log(newProps);
  }

  public async componentDidMount(): Promise<void> {
    return this.initHistory();
  }

  public componentWillUnmount(): void {
    this.state.compositeSubscription.unsubscribe();
  }

  public render(): JSX.Element {
    console.log(this.props);
    return (
      <ViewModule>
        <ViewModuleHeader>Challenge History</ViewModuleHeader>
        {this.props.listingChallengeHistory.map((e, i) => {
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
        listingHelper.failedChallenges(),
        listingHelper.successfulChallenges(),
      ).subscribe(this.handleSubscriptionReturn);
      this.setState({ compositeSubscription: subscription });
    }
  };
}

const mapToStateToProps = (state: State, ownProps: ChallengeHistoryProps): ChallengeHistoryReduxProps => {
  const { listingChallenges } = state;
  const listingChallengeHistory = listingChallenges.get(ownProps.listing) || List();
  return {
    ...ownProps,
    listingChallengeHistory
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
    console.log(this.props);
    const wrappedEvent = this.props.challengeData.event;
    return (
      <StyledDiv>
        {new Date((wrappedEvent as any).timestamp * 1000).toUTCString()} - {this.props.challengeData.result}
        {this.renderClaimRewards()}
      </StyledDiv>
    );
  }

  private renderClaimRewards = (): JSX.Element => {
    if (this.props.challengeData.isRewardAvailable) {
      return <>Claim Rewards</>;
    } else {
      return <>Sorry, no rewards for you!</>;
    }
  }

}

export default connect(mapToStateToProps)(ChallengeHistory);
