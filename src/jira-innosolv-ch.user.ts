// ==UserScript==
// @name        JIRA Extensions (TS)
// @version     1.4.5
// @namespace   https://github.com/mauruskuehne/jira-extensions/
// @updateURL   https://github.com/mauruskuehne/jira-extensions/raw/master/jira-innosolv-ch.user.js
// @download    https://github.com/mauruskuehne/jira-extensions/raw/master/jira-innosolv-ch.user.js
// @icon        https://fuse314.github.io/ico/jira-extensions.png
// @author      Daniel Dähler, Maurus Kühne, Gottfried Mayer
// @include     https://jira.innosolv.ch/*
// @require     util.js
// @grant       GM_log
// @run-at      document-idle
// ==/UserScript==

import * as util from './util'

(function() {

    var summaryTimer;
    var commitMessageButtonTimer;

    function addCopyCommitMessageHeaderButton() {
        var source = document.getElementById("opsbar-jira.issue.tools");

        if(source == null) {
            return;
        }

        clearInterval(commitMessageButtonTimer);

        var existing = document.getElementById("commit-header-btn");
        if(existing != null) {
            existing.parentNode.removeChild(existing);
        }

        var newBtn = document.createElement("LI");
        newBtn.id = "commit-header-btn";
        var a = <HTMLLinkElement> document.createElement("A");
        a.innerText = "Commit Header";
        newBtn.appendChild(a);
        newBtn.className = "toolbar-item";

        a.className = "toolbar-trigger viewissue-share";
        a.href = "#";
        a.title = "Commit Message Header kopieren";

        a.onclick = function(){

            var parentIssueSummary = document.getElementById("parent_issue_summary");
            var taskNr = "";
            var taskText = "";

            if(parentIssueSummary != null) {
                taskNr = parentIssueSummary.getAttribute("data-issue-key");
                taskText = parentIssueSummary.title;
            }
            else {
                taskNr = document.getElementById("key-val").innerText;
                taskText = document.getElementById("summary-val").innerText;
            }

            util.copyTextToClipboard(taskNr + ": " + taskText);
        };

        source.appendChild(newBtn);
    }

    function fixTableSize() {
        var source = <HTMLElement> document.querySelector("#tempo-table > div > #issuetable > thead > tr:nth-child(2) > th.left.colHeaderLink.headerrow-summary.padding");
        var destination = <HTMLTableCellElement> document.querySelector("#stalker > div > div.content-container.tt-content-container > div > div > #issuetable > thead > tr:nth-child(2) > th.left.colHeaderLink.headerrow-summary.padding");

        if(destination != null && source != null) {
            destination.width = (source.offsetWidth - 8).toString();
        }
    }

    function expandSummaries() {

        var summaries = document.getElementsByClassName("summary");
        for (var i = 0; i < summaries.length; i++) {
            var summary = summaries[i];
            var parentLink = <HTMLElement> summary.getElementsByClassName("parentIssue")[0];
            if (parentLink)
            {
                if (!parentLink.dataset['issue-number'])
                {
                    parentLink.dataset['issue-number'] = parentLink.innerText;
                }
                parentLink.innerText = parentLink.dataset['issue-number'] + ": " + util.shortenText(parentLink.title, 80);
            }
        }

        if(summaries.length > 0) {
            fixTableSize();
            window.onresize = fixTableSize;
            clearInterval(summaryTimer);
        }

        return;
    }

    // I don't know of a better way of dealing with the ajax than to check every second until
    // we find the elements we want.
    GM_log("Timer starting.");
    summaryTimer = setInterval(expandSummaries, 1000);
    commitMessageButtonTimer = setInterval(addCopyCommitMessageHeaderButton, 1000);
    
    document.body.addEventListener('click', function() {
        clearInterval(summaryTimer);
        clearInterval(commitMessageButtonTimer);
        summaryTimer = setInterval(expandSummaries, 1000);
        commitMessageButtonTimer = setInterval(addCopyCommitMessageHeaderButton, 1000);
    }, true);

})();
