development concerns
* adding document types is/will be too difficult
* load times- don't read entire db.  read recent transactions only
* developing UI takes too much time- loading db, setting up edge cases
* maybe it's not appropriate to use platform-specific UI (yet)?
* sync works, but is not automatic
* transaction import works, but is not automatic
* mobile ui
* split out/standardize pages into scaffolding components
* using react-router instead of dialogs might be more correct/appropriate
* split out pages from components folder
* split out forms components

usability concerns
* manual transaction input
* transaction categorization
* category envelopes
* income planner
* xmas planner

potential solutions
* storybook
* react-datasheet

cleanup
* replace history api calls with react-router-redux
* replace redux-forms with react-forms
* remove redux-ui
* make actions change app state rather than waiting for actions to complete (remove withRouter)
