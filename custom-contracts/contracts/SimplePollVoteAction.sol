// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IPostAction } from "./extensions/actions/ActionHub.sol";
import { KeyValue } from "./core/types/Types.sol";
import { BasePostAction } from "./actions/post/base/BasePostAction.sol";
import { IFeed } from "./core/interfaces/IFeed.sol";

// SimplePollVoteAction
// A simple post action allowing users to cast a boolean vote (e.g., Yes/No) on a post.
// Prevents double voting.

contract SimplePollVoteAction is BasePostAction {
    event PollVoted(address indexed voter, uint256 indexed postId, bool vote);

    // feed => postId => voter => hasVoted
    mapping(address => mapping(uint256 => mapping(address => bool))) private _hasVoted;

    mapping(address feed => mapping(uint256 postId => mapping(bool vote => uint256 count))) private _voteCounts;

    constructor(address actionHub) BasePostAction(actionHub) {}

    function _configure(
        address originalMsgSender,
        address feed,
        uint256 postId,
        KeyValue[] calldata params
    ) internal override returns (bytes memory) {
        require(
            originalMsgSender == IFeed(feed).getPostAuthor(postId),
            "Only author can configure"
        );
        // Any extra configuration logic could be added here (e.g. mapping each possible vote type to some string)
        // Emitting an event Lens_ActionHub_PostAction_Configured happens automatically via ActionHub
        return "";
    }

    function _execute(
        address originalMsgSender,
        address feed,
        uint256 postId,
        KeyValue[] calldata params
    ) internal override returns (bytes memory) {
        require(!_hasVoted[feed][postId][originalMsgSender], "Already voted");

        _hasVoted[feed][postId][originalMsgSender] = true;

        bool voteFound;
        bool vote;
        for (uint256 i = 0; i < params.length; i++) {
          if (params[i].key == keccak256("lens.param.vote")) {
              voteFound = true;
              vote = abi.decode(params[i].value, (bool));
              break;
          }
        }

        require(voteFound, "Vote not found in params");

        _voteCounts[feed][postId][vote]++;

        return abi.encode(vote);
    }

    function getVoteCounts(address feed, uint256 postId) external view returns (uint256 ya, uint256 nay) {
        return (_voteCounts[feed][postId][false], _voteCounts[feed][postId][true]);
    }
}