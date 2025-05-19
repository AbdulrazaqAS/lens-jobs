// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IPostAction} from "./extensions/actions/ActionHub.sol";
import {KeyValue} from "./core/types/Types.sol";
import {BasePostAction} from "./actions/post/base/BasePostAction.sol";
import {IFeed} from "./core/interfaces/IFeed.sol";

// JobPostApplyAction
// Apply action for job post

contract JobPostApplyAction is BasePostAction {
    event JobApplied(address indexed freelancer, address indexed feed, uint256 indexed postId);

    // feed => postId => voter => hasVoted
    mapping(address => mapping(uint256 => mapping(address => bool))) public hasApplied;

    // feed => postId => applications
    mapping(address => mapping(uint256 => uint256)) public applications;

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
        
        return "";
    }

    function _execute(
        address originalMsgSender,
        address feed,
        uint256 postId,
        KeyValue[] calldata params
    ) internal override returns (bytes memory) {
        bool callerHasApplied = hasApplied[feed][postId][originalMsgSender];

        hasApplied[feed][postId][originalMsgSender] = !callerHasApplied;  // toggle application status

        if (!callerHasApplied) {  // An application
            emit JobApplied(originalMsgSender, feed, postId);
        }

        return "";
    }
}
