// https://pouchdb.com/api.html#changes

declare namespace PouchDB {
  interface ChangesOpts {
    // Will emit change events for all future changes until cancelled.
    live?: boolean
    // Include the associated document with each change.
    include_docs?: boolean
    // Include conflicts
    conflicts?: boolean
    // Include attachments
    attachments?: boolean
    // Return attachment data as Blobs/Buffers, instead of as base64-encoded strings
    binary?: boolean
    // Reverse the order of the output documents.
    descending?: boolean
    // Start the results from the change immediately after the given sequence number.
    // You can also pass 'now' if you want only new changes (when live is true).
    since?: number | 'now'
    // Limit the number of results to this number.
    limit?: number
    // Request timeout (in milliseconds), use false to disable.
    timeout?: number
    // For http adapter only, time in milliseconds for server to give a heartbeat to
    // keep long connections open. Defaults to 10000 (10 seconds), use false to disable the default.
    heartbeat?: number

    // Reference a filter function from a design document to selectively get updates.
    // To use a view function, pass _view here and provide a reference to the view function in
    // options.view. See filtered changes for details.
    filter?: Function
    // Only show changes for docs with these ids (array of strings).
    doc_ids?: string[]
    // Object containing properties that are passed to the filter function, e.g. {"foo:"bar"},
    // where "bar" will be available in the filter function as params.query.foo. To access the
    // params, define your filter function like function (doc, params) {/* ... */}.
    query_params?: any
    // Specify a view function (e.g. 'design_doc_name/view_name' or 'view_name' as shorthand
    // for 'view_name/view_name') to act as a filter. Documents counted as “passed” for a view
    // filter if a map function emits at least one record for them. Note: options.filter must be
    // set to '_view' for this option to work.
    view?: Function

    // (previously options.returnDocs): Is available for non-http databases and defaults to true.
    // Passing false prevents the changes feed from keeping all the documents in memory – in other
    // words complete always has an empty results array, and the change event is the only way to get the event.
    // Useful for large change sets where otherwise you would run out of memory.
    return_docs?: boolean
    // Only available for http databases, this configures how many changes to fetch at a time.
    // Increasing this can reduce the number of requests made. Default is 25.
    batch_size?: number
    // Specifies how many revisions are returned in the changes array. The default, 'main_only',
    // will only return the current “winning” revision; 'all_docs' will return all leaf revisions
    // (including conflicts and deleted former conflicts). Most likely you won’t need this unless
    // you’re writing a replicator.
    style?: 'main_only' | 'all_docs'
  }

  interface ChangeInfo<Content> {
    id: Core.DocumentId
    changes: any[]
    doc?: Core.ExistingDocument<Content>
    deleted?: boolean
    seq: number
  }

  interface CompleteInfo<Content> {
    results: ChangeInfo<Content>[]
    last_seq: number
  }

  interface ChangeEmitter {
    cancel (): any

    on<Content> (event: 'change', handler: (change: ChangeInfo<Content>) => any): ChangeEmitter
    on<Content> (event: 'complete', handler: (info: CompleteInfo<Content>) => any): ChangeEmitter
    on (event: 'error', handler: (err: Error) => any): ChangeEmitter
  }
  interface Database<Content extends {} = {}> {
    changes (options: ChangesOpts): ChangeEmitter
  }
}
