development concerns
* adding document types is/will be too difficult
* load times- don't read entire db.  read recent transactions only
* maybe it's not appropriate to use platform-specific UI (yet)?
* sync works, but is not automatic
* transaction import works, but is not automatic
* mobile ui
* split out/standardize pages into scaffolding components
* using react-router instead of dialogs might be more correct/appropriate

usability concerns
* manual transaction input
* transaction categorization
* category envelopes
* income planner
* xmas planner

potential solutions
* react-datasheet

cleanup
* make actions change app state rather than waiting for actions to complete (remove withRouter)
* remove pushChanges
