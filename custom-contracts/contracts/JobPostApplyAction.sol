// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IPostAction} from "./extensions/actions/ActionHub.sol";
import {KeyValue} from "./core/types/Types.sol";
import {BasePostAction} from "./actions/post/base/BasePostAction.sol";
import {IFeed} from "./core/interfaces/IFeed.sol";

// JobPostApplyAction
// Apply action for job post

contract JobPostApplyAction is BasePostAction {
    // feed => postId => freelancer => hasVoted
    mapping(address => mapping(uint256 => mapping(address => bool))) public hasApplied;

    // feed => postId => applications
    mapping(address => mapping(uint256 => uint256)) public applications;

    // feed => postId => freelancer => applicationFormUri
    mapping(address => mapping(uint256 => mapping(address => bytes))) public applicationFormUris;

    event JobApplied(address indexed freelancer, address indexed feed, uint256 indexed postId);
    event JobApplicationRevoked(address indexed freelancer, address indexed feed, uint256 indexed postId);

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
        bool appFormUriFound;
        bool revokeFound;
        bytes memory appFormUri;
        bool revoke;

        bytes32 appFormUriHash = keccak256("lens.param.appFormUri");
        bytes32 revokeHash = keccak256("lens.param.revoke");

        for (uint256 i = 0; i < params.length; i++) {
          if (params[i].key == appFormUriHash) {
              appFormUriFound = true;
              appFormUri = params[i].value;
              continue;
          } else if (params[i].key == revokeHash) {
              revokeFound = true;
              revoke = abi.decode(params[i].value, (bool));
              continue;
          }
        }

        require(revokeFound, "Revoke parameter not found");
        require(appFormUriFound, "Application form uri parameter missing");
        
        bool callerHasApplied = hasApplied[feed][postId][originalMsgSender];
        require(!revoke && !callerHasApplied, "Already applied");
        require(!revoke && appFormUriFound, "Application form uri missing");
        
        hasApplied[feed][postId][originalMsgSender] = !callerHasApplied;

        if (!revoke) applicationFormUris[feed][postId][originalMsgSender] = appFormUri;
        else delete applicationFormUris[feed][postId][originalMsgSender];

        if (!callerHasApplied) {  // An application
            emit JobApplied(originalMsgSender, feed, postId);
        } else {
            emit JobApplicationRevoked(originalMsgSender, feed, postId);
        }

        return "";
    }
}
