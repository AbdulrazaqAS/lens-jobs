import {useState} from "react";

import NewJobPostForm from "./NewJobPostForm";
import { SessionClient } from "@lens-protocol/client";

interface Props {
    sessionClient : SessionClient;
}

export function AccountJobsPage({sessionClient}: Props){
    return (
        <div>
            <NewJobPostForm sessionClient={sessionClient} />
        </div>
    )
}