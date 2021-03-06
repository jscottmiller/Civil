import * as React from "react";
import { buttonSizes } from "../Button";
import { InputGroup, TextInput } from "../input/";
import { CommitVoteProps } from "./types";
import { TransactionDarkButton } from "../TransactionButton";
import {
  FormHeader,
  FormCopy,
  AccentHRule,
  FormQuestion,
  VoteOptionsContainer,
  StyledOrText,
} from "./styledComponents";

export interface CommitVoteState {
  numTokensError?: string;
  saltError?: string;
}

export class CommitVote extends React.Component<CommitVoteProps, CommitVoteState> {
  constructor(props: CommitVoteProps) {
    super(props);
    this.state = {
      numTokensError: undefined,
      saltError: undefined,
    };
  }

  public render(): JSX.Element {
    const disableButtons = !!this.state.numTokensError || !!this.state.saltError;
    return (
      <>
        {this.renderFormHeader()}
        <FormCopy>Vote with your CVL tokens, and help curate credible, trustworthy journalism on Civil.</FormCopy>
        <AccentHRule />

        <FormQuestion>Should this newsroom remain or be removed from the Civil Registry?</FormQuestion>

        {this.renderNumTokensInput()}

        {this.renderSaltInput()}

        <VoteOptionsContainer>
          <div onMouseEnter={this.setVoteToRemain}>
            <TransactionDarkButton
              size={buttonSizes.MEDIUM}
              transactions={this.props.transactions}
              modalContentComponents={this.props.modalContentComponents}
              disabled={disableButtons}
            >
              ✔ Remain
            </TransactionDarkButton>
          </div>
          <StyledOrText>or</StyledOrText>
          <div onMouseEnter={this.setVoteToRemove}>
            <TransactionDarkButton
              size={buttonSizes.MEDIUM}
              transactions={this.props.transactions}
              modalContentComponents={this.props.modalContentComponents}
              disabled={disableButtons}
            >
              ✖ Remove
            </TransactionDarkButton>
          </div>
        </VoteOptionsContainer>
      </>
    );
  }

  private renderFormHeader = (): JSX.Element => {
    if (this.props.userHasCommittedVote) {
      return (
        <>
          <FormHeader>Thanks for participating in this challenge!</FormHeader>
          <FormCopy>
            You have committed a vote in this challenge. Thanks for that. You can change your vote until the deadline.
          </FormCopy>
        </>
      );
    }
    return <FormHeader>You’re invited to vote!</FormHeader>;
  };

  private renderNumTokensInput = (): JSX.Element => {
    let label = "Enter amount of tokens to vote";
    let className;

    if (this.state.numTokensError) {
      label = this.state.numTokensError;
      className = "error";
    }
    return (
      <InputGroup
        prepend="CVL"
        label={label}
        className={className}
        placeholder="Enter a value"
        name="numTokens"
        value={!this.props.numTokens ? "" : this.props.numTokens.toString()}
        onChange={this.onChange}
      />
    );
  };

  private renderSaltInput = (): JSX.Element => {
    let label = "Enter a number to use as your salt";
    let className;

    if (this.state.saltError) {
      label = this.state.saltError;
      className = "error";
    }
    return (
      <TextInput
        label={label}
        className={className}
        placeholder="Enter a unique number"
        value={this.props.salt}
        name="salt"
        onChange={this.onChange}
      />
    );
  };

  private onChange = (name: string, value: string): void => {
    let validateFn;
    if (name === "salt") {
      validateFn = this.validateSalt;
    }
    if (name === "numTokens") {
      validateFn = this.validateNumTokens;
    }
    this.props.onInputChange({ [name]: value }, validateFn);
  };

  private setVoteToRemain = (): void => {
    // A "remain" vote is a vote that doesn't support the
    // challenge, so `voteOption === 0`
    this.props.onInputChange({ voteOption: "0" });
  };

  private setVoteToRemove = (): void => {
    // A "remove" vote is a vote that supports the
    // challenge, so `voteOption === 1`
    this.props.onInputChange({ voteOption: "1" });
  };

  private validateSalt = (): boolean => {
    console.log("validate salt", this.props);
    let isValid = true;

    if (!this.props.salt || this.props.salt.length === 0) {
      isValid = false;
      this.setState({
        saltError: "Please enter a valid salt phrase",
      });
    } else {
      this.setState({ saltError: undefined });
    }

    return isValid;
  };

  private validateNumTokens = (): boolean => {
    console.log("validate num tokens", this.props);
    const numTokens = !this.props.numTokens ? 0 : parseInt(this.props.numTokens as string, 10);
    let isValid = true;

    if (!numTokens || numTokens === 0) {
      isValid = false;
      this.setState({
        numTokensError: "Please enter a valid token vote amount",
      });

      // @TODO(jon): Add client-side validation that checks that
      // numTokens <= this.props.tokenBalance. Though this may
      // not be needed if we change to a slider UI element or
      // when we implement pre-approving tokens for voting
      // If we do client-side validation, we'd want to do
      // something like:
      // `this.setState({ numTokensError: "Token vote amount exceeds your balance" });`
    } else {
      this.setState({ numTokensError: undefined });
    }

    return isValid;
  };
}
