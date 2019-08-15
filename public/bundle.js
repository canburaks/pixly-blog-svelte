
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.app = factory());
}(this, function () { 'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        for (const key in attributes) {
            if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key in node) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                for (let j = 0; j < node.attributes.length; j += 1) {
                    const attribute = node.attributes[j];
                    if (!attributes[attribute.name])
                        node.removeAttribute(attribute.name);
                }
                return nodes.splice(i, 1)[0]; // TODO strip unwanted attributes
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function claim_text(nodes, data) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeType === 3) {
                node.data = data;
                return nodes.splice(i, 1)[0];
            }
        }
        return text(data);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value) {
        node.style.setProperty(key, value);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(html, anchor = null) {
            this.e = element('div');
            this.a = anchor;
            this.u(html);
        }
        m(target, anchor = null) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(target, this.n[i], anchor);
            }
            this.t = target;
        }
        u(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        p(html) {
            this.d();
            this.u(html);
            this.m(this.t, this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    /**
     * Derived value store by synchronizing one or more readable stores and
     * applying an aggregation function over its input values.
     * @param {Stores} stores input stores
     * @param {function(Stores=, function(*)=):*}fn function callback that aggregates the values
     * @param {*=}initial_value when used asynchronously
     */
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.7.1 */

    function create_fragment(ctx) {
    	var current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	return {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base, $location, $routes;

    	

      let { basepath = "/", url = null } = $$props;

      const locationContext = getContext(LOCATION);
      const routerContext = getContext(ROUTER);

      const routes = writable([]); validate_store(routes, 'routes'); component_subscribe($$self, routes, $$value => { $routes = $$value; $$invalidate('$routes', $routes); });
      const activeRoute = writable(null);
      let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

      // If locationContext is not set, this is the topmost Router in the tree.
      // If the `url` prop is given we force the location to it.
      const location =
        locationContext ||
        writable(url ? { pathname: url } : globalHistory.location); validate_store(location, 'location'); component_subscribe($$self, location, $$value => { $location = $$value; $$invalidate('$location', $location); });

      // If routerContext is set, the routerBase of the parent Router
      // will be the base for this Router's descendants.
      // If routerContext is not set, the path and resolved uri will both
      // have the value of the basepath prop.
      const base = routerContext
        ? routerContext.routerBase
        : writable({
            path: basepath,
            uri: basepath
          }); validate_store(base, 'base'); component_subscribe($$self, base, $$value => { $base = $$value; $$invalidate('$base', $base); });

      const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
        // If there is no activeRoute, the routerBase will be identical to the base.
        if (activeRoute === null) {
          return base;
        }

        const { path: basepath } = base;
        const { route, uri } = activeRoute;
        // Remove the potential /* or /*splatname from
        // the end of the child Routes relative paths.
        const path = route.default ? basepath : route.path.replace(/\*.*$/, "");

        return { path, uri };
      });

      function registerRoute(route) {
        const { path: basepath } = $base;
        let { path } = route;

        // We store the original path in the _path property so we can reuse
        // it when the basepath changes. The only thing that matters is that
        // the route reference is intact, so mutation is fine.
        route._path = path;
        route.path = combinePaths(basepath, path);

        if (typeof window === "undefined") {
          // In SSR we should set the activeRoute immediately if it is a match.
          // If there are more Routes being registered after a match is found,
          // we just skip them.
          if (hasActiveRoute) {
            return;
          }

          const matchingRoute = match(route, $location.pathname);
          if (matchingRoute) {
            activeRoute.set(matchingRoute);
            hasActiveRoute = true;
          }
        } else {
          routes.update(rs => {
            rs.push(route);
            return rs;
          });
        }
      }

      function unregisterRoute(route) {
        routes.update(rs => {
          const index = rs.indexOf(route);
          rs.splice(index, 1);
          return rs;
        });
      }

      if (!locationContext) {
        // The topmost Router in the tree is responsible for updating
        // the location store and supplying it through context.
        onMount(() => {
          const unlisten = globalHistory.listen(history => {
            location.set(history.location);
          });

          return unlisten;
        });

        setContext(LOCATION, location);
      }

      setContext(ROUTER, {
        activeRoute,
        base,
        routerBase,
        registerRoute,
        unregisterRoute
      });

    	const writable_props = ['basepath', 'url'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('basepath' in $$props) $$invalidate('basepath', basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate('url', url = $$props.url);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = ($$dirty = { $base: 1, $routes: 1, $location: 1 }) => {
    		if ($$dirty.$base) { {
            const { path: basepath } = $base;
            routes.update(rs => {
              rs.forEach(r => (r.path = combinePaths(basepath, r._path)));
              return rs;
            });
          } }
    		if ($$dirty.$routes || $$dirty.$location) { {
            const bestMatch = pick($routes, $location.pathname);
            activeRoute.set(bestMatch);
          } }
    	};

    	return {
    		basepath,
    		url,
    		routes,
    		location,
    		base,
    		$$slots,
    		$$scope
    	};
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["basepath", "url"]);
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.7.1 */

    // (39:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block_1,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.component !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			if_block.l(nodes);
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    // (42:2) {:else}
    function create_else_block(ctx) {
    	var current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	return {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    // (40:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	var switch_instance_anchor, current;

    	var switch_instance_spread_levels = [
    		ctx.routeParams,
    		ctx.routeProps
    	];

    	var switch_value = ctx.component;

    	function switch_props(ctx) {
    		let switch_instance_props = {};
    		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}
    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	return {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		l: function claim(nodes) {
    			if (switch_instance) switch_instance.$$.fragment.l(nodes);
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = (changed.routeParams || changed.routeProps) ? get_spread_update(switch_instance_spread_levels, [
    				(changed.routeParams) && ctx.routeParams,
    				(changed.routeProps) && ctx.routeProps
    			]) : {};

    			if (switch_value !== (switch_value = ctx.component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(switch_instance_anchor);
    			}

    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.$activeRoute !== null && ctx.$activeRoute.route === ctx.route) && create_if_block(ctx);

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.$activeRoute !== null && ctx.$activeRoute.route === ctx.route) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;

    	

      let { path = "", component = null } = $$props;

      const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER); validate_store(activeRoute, 'activeRoute'); component_subscribe($$self, activeRoute, $$value => { $activeRoute = $$value; $$invalidate('$activeRoute', $activeRoute); });

      const route = {
        path,
        // If no path prop is given, this Route will act as the default Route
        // that is rendered if no other Route in the Router is a match.
        default: path === ""
      };
      let routeParams = {};
      let routeProps = {};

      registerRoute(route);

      // There is no need to unregister Routes in SSR since it will all be
      // thrown away anyway.
      if (typeof window !== "undefined") {
        onDestroy(() => {
          unregisterRoute(route);
        });
      }

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$new_props) $$invalidate('path', path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate('component', component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = ($$dirty = { $activeRoute: 1, $$props: 1 }) => {
    		if ($$dirty.$activeRoute) { if ($activeRoute && $activeRoute.route === route) {
            $$invalidate('routeParams', routeParams = $activeRoute.params);
          } }
    		{
            const { path, component, ...rest } = $$props;
            $$invalidate('routeProps', routeProps = rest);
          }
    	};

    	return {
    		path,
    		component,
    		activeRoute,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["path", "component"]);
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.7.1 */

    const file = "node_modules/svelte-routing/src/Link.svelte";

    function create_fragment$2(ctx) {
    	var a, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var a_levels = [
    		{ href: ctx.href },
    		{ "aria-current": ctx.ariaCurrent },
    		ctx.props
    	];

    	var a_data = {};
    	for (var i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	return {
    		c: function create() {
    			a = element("a");

    			if (default_slot) default_slot.c();
    			this.h();
    		},

    		l: function claim(nodes) {
    			a = claim_element(nodes, "A", { href: true, "aria-current": true }, false);
    			var a_nodes = children(a);

    			if (default_slot) default_slot.l(a_nodes);
    			a_nodes.forEach(detach);
    			this.h();
    		},

    		h: function hydrate() {
    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    			dispose = listen(a, "click", ctx.onClick);
    		},

    		m: function mount(target, anchor) {
    			insert(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				(changed.href) && { href: ctx.href },
    				(changed.ariaCurrent) && { "aria-current": ctx.ariaCurrent },
    				(changed.props) && ctx.props
    			]));
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(a);
    			}

    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $base, $location;

    	

      let { to = "#", replace = false, state = {}, getProps = () => ({}) } = $$props;

      const { base } = getContext(ROUTER); validate_store(base, 'base'); component_subscribe($$self, base, $$value => { $base = $$value; $$invalidate('$base', $base); });
      const location = getContext(LOCATION); validate_store(location, 'location'); component_subscribe($$self, location, $$value => { $location = $$value; $$invalidate('$location', $location); });
      const dispatch = createEventDispatcher();

      let href, isPartiallyCurrent, isCurrent, props;

      function onClick(event) {
        dispatch("click", event);

        if (shouldNavigate(event)) {
          event.preventDefault();
          // Don't push another entry to the history stack when the user
          // clicks on a Link to the page they are currently on.
          const shouldReplace = $location.pathname === href || replace;
          navigate(href, { state, replace: shouldReplace });
        }
      }

    	const writable_props = ['to', 'replace', 'state', 'getProps'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('to' in $$props) $$invalidate('to', to = $$props.to);
    		if ('replace' in $$props) $$invalidate('replace', replace = $$props.replace);
    		if ('state' in $$props) $$invalidate('state', state = $$props.state);
    		if ('getProps' in $$props) $$invalidate('getProps', getProps = $$props.getProps);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	let ariaCurrent;

    	$$self.$$.update = ($$dirty = { to: 1, $base: 1, $location: 1, href: 1, isCurrent: 1, getProps: 1, isPartiallyCurrent: 1 }) => {
    		if ($$dirty.to || $$dirty.$base) { $$invalidate('href', href = to === "/" ? $base.uri : resolve(to, $base.uri)); }
    		if ($$dirty.$location || $$dirty.href) { $$invalidate('isPartiallyCurrent', isPartiallyCurrent = startsWith($location.pathname, href)); }
    		if ($$dirty.href || $$dirty.$location) { $$invalidate('isCurrent', isCurrent = href === $location.pathname); }
    		if ($$dirty.isCurrent) { $$invalidate('ariaCurrent', ariaCurrent = isCurrent ? "page" : undefined); }
    		if ($$dirty.getProps || $$dirty.$location || $$dirty.href || $$dirty.isPartiallyCurrent || $$dirty.isCurrent) { $$invalidate('props', props = getProps({
            location: $location,
            href,
            isPartiallyCurrent,
            isCurrent
          })); }
    	};

    	return {
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		href,
    		props,
    		onClick,
    		ariaCurrent,
    		$$slots,
    		$$scope
    	};
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["to", "replace", "state", "getProps"]);
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * An action to be added at a root element of your application to
     * capture all relative links and push them onto the history stack.
     *
     * Example:
     * ```html
     * <div use:links>
     *   <Router>
     *     <Route path="/" component={Home} />
     *     <Route path="/p/:projectId/:docId?" component={ProjectScreen} />
     *     {#each projects as project}
     *       <a href="/p/{project.id}">{project.title}</a>
     *     {/each}
     *   </Router>
     * </div>
     * ```
     */
    function links(node) {
      function findClosest(tagName, el) {
        while (el && el.tagName !== tagName) {
          el = el.parentNode;
        }
        return el;
      }

      function onClick(event) {
        const anchor = findClosest("A", event.target);

        if (
          anchor &&
          anchor.target === "" &&
          anchor.host === location.host &&
          shouldNavigate(event) &&
          !anchor.hasAttribute("noroute")
        ) {
          event.preventDefault();
          navigate(anchor.pathname, { replace: anchor.hasAttribute("replace") });
        }
      }

      node.addEventListener("click", onClick);

      return {
        destroy() {
          node.removeEventListener("click", onClick);
        }
      };
    }

    /* src/components/Navbar.svelte generated by Svelte v3.7.1 */

    const file$1 = "src/components/Navbar.svelte";

    function create_fragment$3(ctx) {
    	var nav, div0, a, p, t0, span0, t1, t2, span1, t3, t4, span2, t5, t6, span3, t7, t8, div1;

    	return {
    		c: function create() {
    			nav = element("nav");
    			div0 = element("div");
    			a = element("a");
    			p = element("p");
    			t0 = text("PI\n                ");
    			span0 = element("span");
    			t1 = text("X");
    			t2 = space();
    			span1 = element("span");
    			t3 = text("L");
    			t4 = space();
    			span2 = element("span");
    			t5 = text("Y");
    			t6 = space();
    			span3 = element("span");
    			t7 = text("BLOG");
    			t8 = space();
    			div1 = element("div");
    			this.h();
    		},

    		l: function claim(nodes) {
    			nav = claim_element(nodes, "NAV", { id: true, class: true }, false);
    			var nav_nodes = children(nav);

    			div0 = claim_element(nav_nodes, "DIV", { class: true }, false);
    			var div0_nodes = children(div0);

    			a = claim_element(div0_nodes, "A", { href: true, class: true }, false);
    			var a_nodes = children(a);

    			p = claim_element(a_nodes, "P", { class: true }, false);
    			var p_nodes = children(p);

    			t0 = claim_text(p_nodes, "PI\n                ");

    			span0 = claim_element(p_nodes, "SPAN", { class: true }, false);
    			var span0_nodes = children(span0);

    			t1 = claim_text(span0_nodes, "X");
    			span0_nodes.forEach(detach);
    			t2 = claim_text(p_nodes, "\n                ");

    			span1 = claim_element(p_nodes, "SPAN", { class: true }, false);
    			var span1_nodes = children(span1);

    			t3 = claim_text(span1_nodes, "L");
    			span1_nodes.forEach(detach);
    			t4 = claim_text(p_nodes, "\n                ");

    			span2 = claim_element(p_nodes, "SPAN", { class: true }, false);
    			var span2_nodes = children(span2);

    			t5 = claim_text(span2_nodes, "Y");
    			span2_nodes.forEach(detach);
    			t6 = claim_text(p_nodes, "\n                ");

    			span3 = claim_element(p_nodes, "SPAN", { class: true }, false);
    			var span3_nodes = children(span3);

    			t7 = claim_text(span3_nodes, "BLOG");
    			span3_nodes.forEach(detach);
    			p_nodes.forEach(detach);
    			a_nodes.forEach(detach);
    			div0_nodes.forEach(detach);
    			t8 = claim_text(nav_nodes, "\n    \n    ");

    			div1 = claim_element(nav_nodes, "DIV", { class: true }, false);
    			var div1_nodes = children(div1);

    			div1_nodes.forEach(detach);
    			nav_nodes.forEach(detach);
    			this.h();
    		},

    		h: function hydrate() {
    			attr(span0, "class", "span-1 svelte-1lbxtcg");
    			add_location(span0, file$1, 6, 16, 154);
    			attr(span1, "class", "span-2 svelte-1lbxtcg");
    			add_location(span1, file$1, 7, 16, 200);
    			attr(span2, "class", "span-3 svelte-1lbxtcg");
    			add_location(span2, file$1, 8, 16, 246);
    			attr(span3, "class", "span-blog svelte-1lbxtcg");
    			add_location(span3, file$1, 9, 16, 292);
    			attr(p, "class", "brand-pixly-new svelte-1lbxtcg");
    			add_location(p, file$1, 4, 12, 91);
    			attr(a, "href", "/");
    			attr(a, "class", "svelte-1lbxtcg");
    			add_location(a, file$1, 3, 8, 65);
    			attr(div0, "class", "brand-box nav-left");
    			add_location(div0, file$1, 2, 4, 24);
    			attr(div1, "class", "nav-pages nav-middle");
    			add_location(div1, file$1, 14, 4, 378);
    			attr(nav, "id", "navbar");
    			attr(nav, "class", "svelte-1lbxtcg");
    			add_location(nav, file$1, 1, 0, 1);
    		},

    		m: function mount(target, anchor) {
    			insert(target, nav, anchor);
    			append(nav, div0);
    			append(div0, a);
    			append(a, p);
    			append(p, t0);
    			append(p, span0);
    			append(span0, t1);
    			append(p, t2);
    			append(p, span1);
    			append(span1, t3);
    			append(p, t4);
    			append(p, span2);
    			append(span2, t5);
    			append(p, t6);
    			append(p, span3);
    			append(span3, t7);
    			append(nav, t8);
    			append(nav, div1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(nav);
    			}
    		}
    	};
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, []);
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.7.1 */

    const file$2 = "src/components/Footer.svelte";

    function create_fragment$4(ctx) {
    	var div, a0, svg, path, t0, a1, t1;

    	return {
    		c: function create() {
    			div = element("div");
    			a0 = element("a");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			a1 = element("a");
    			t1 = text("pixlymovie");
    			this.h();
    		},

    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true, title: true }, false);
    			var div_nodes = children(div);

    			a0 = claim_element(div_nodes, "A", { target: true, rel: true, href: true, class: true }, false);
    			var a0_nodes = children(a0);

    			svg = claim_element(a0_nodes, "svg", { "aria-hidden": true, focusable: true, class: true, role: true, xmlns: true, viewBox: true }, true);
    			var svg_nodes = children(svg);

    			path = claim_element(svg_nodes, "path", { fill: true, d: true }, true);
    			var path_nodes = children(path);

    			path_nodes.forEach(detach);
    			svg_nodes.forEach(detach);
    			a0_nodes.forEach(detach);
    			t0 = claim_text(div_nodes, "\n    ");

    			a1 = claim_element(div_nodes, "A", { target: true, rel: true, href: true, class: true }, false);
    			var a1_nodes = children(a1);

    			t1 = claim_text(a1_nodes, "pixlymovie");
    			a1_nodes.forEach(detach);
    			div_nodes.forEach(detach);
    			this.h();
    		},

    		h: function hydrate() {
    			attr(path, "fill", "currentColor");
    			attr(path, "d", "M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z");
    			add_location(path, file$2, 10, 12, 390);
    			attr(svg, "aria-hidden", "true");
    			attr(svg, "focusable", "false");
    			attr(svg, "class", "f-icon svg-inline--fa fa-twitter fa-w-16 svelte-my88j0");
    			attr(svg, "role", "img");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "viewBox", "0 0 512 512");
    			add_location(svg, file$2, 6, 8, 184);
    			attr(a0, "target", "_blank");
    			attr(a0, "rel", `https://pixly.app${window.location.pathname}`);
    			attr(a0, "href", "https://twitter.com/pixlymovie");
    			attr(a0, "class", "svelte-my88j0");
    			add_location(a0, file$2, 5, 4, 65);
    			attr(a1, "target", "_blank");
    			attr(a1, "rel", `https://pixly.app${window.location.pathname}`);
    			attr(a1, "href", "https://twitter.com/pixlymovie");
    			attr(a1, "class", " svelte-my88j0");
    			add_location(a1, file$2, 13, 4, 1248);
    			attr(div, "class", "footer-twitter footer  svelte-my88j0");
    			attr(div, "title", "@pixlymovie");
    			add_location(div, file$2, 4, 0, 4);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, a0);
    			append(a0, svg);
    			append(svg, path);
    			append(div, t0);
    			append(div, a1);
    			append(a1, t1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$4, safe_not_equal, []);
    	}
    }

    /* src/components/PostItem.svelte generated by Svelte v3.7.1 */

    const file$3 = "src/components/PostItem.svelte";

    // (17:20) <Link to="{`/post/${post.slug}`}" state={{id:post.id}}>
    function create_default_slot_2(ctx) {
    	var t_value = ctx.post.header, t;

    	return {
    		c: function create() {
    			t = text(t_value);
    		},

    		l: function claim(nodes) {
    			t = claim_text(nodes, t_value);
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.post) && t_value !== (t_value = ctx.post.header)) {
    				set_data(t, t_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (24:20) <Link to="{`/post/${post.slug}`}" state={{id:post.id}}>
    function create_default_slot_1(ctx) {
    	var t_value = ctx.post.summary, t;

    	return {
    		c: function create() {
    			t = text(t_value);
    		},

    		l: function claim(nodes) {
    			t = claim_text(nodes, t_value);
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.post) && t_value !== (t_value = ctx.post.summary)) {
    				set_data(t, t_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (35:8) {#if post.image }
    function create_if_block$1(ctx) {
    	var div, current;

    	var link = new Link({
    		props: {
    		to: `/post/${ctx.post.slug}`,
    		state: {id:ctx.post.id},
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div = element("div");
    			link.$$.fragment.c();
    			this.h();
    		},

    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true }, false);
    			var div_nodes = children(div);

    			link.$$.fragment.l(div_nodes);
    			div_nodes.forEach(detach);
    			this.h();
    		},

    		h: function hydrate() {
    			attr(div, "class", "image-box svelte-1wx1il9");
    			add_location(div, file$3, 35, 12, 933);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(link, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var link_changes = {};
    			if (changed.post) link_changes.to = `/post/${ctx.post.slug}`;
    			if (changed.post) link_changes.state = {id:ctx.post.id};
    			if (changed.$$scope || changed.post) link_changes.$$scope = { changed, ctx };
    			link.$set(link_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(link);
    		}
    	};
    }

    // (37:16) <Link to="{`/post/${post.slug}`}" state={{id:post.id}}>
    function create_default_slot(ctx) {
    	var img, img_src_value;

    	return {
    		c: function create() {
    			img = element("img");
    			this.h();
    		},

    		l: function claim(nodes) {
    			img = claim_element(nodes, "IMG", { src: true, alt: true, class: true }, false);
    			var img_nodes = children(img);

    			img_nodes.forEach(detach);
    			this.h();
    		},

    		h: function hydrate() {
    			attr(img, "src", img_src_value = ctx.post.imageUrl ? ctx.post.imageUrl : ctx.post.image);
    			attr(img, "alt", "Post image");
    			attr(img, "class", "svelte-1wx1il9");
    			add_location(img, file$3, 37, 20, 1049);
    		},

    		m: function mount(target, anchor) {
    			insert(target, img, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.post) && img_src_value !== (img_src_value = ctx.post.imageUrl ? ctx.post.imageUrl : ctx.post.image)) {
    				attr(img, "src", img_src_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(img);
    			}
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	var div2, div1, div0, article, h2, t0, p, t1, a, t2_value = ctx.post.author.name, t2, a_href_value, t3, current;

    	var link0 = new Link({
    		props: {
    		to: `/post/${ctx.post.slug}`,
    		state: {id:ctx.post.id},
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link1 = new Link({
    		props: {
    		to: `/post/${ctx.post.slug}`,
    		state: {id:ctx.post.id},
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var if_block = (ctx.post.image) && create_if_block$1(ctx);

    	return {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			article = element("article");
    			h2 = element("h2");
    			link0.$$.fragment.c();
    			t0 = space();
    			p = element("p");
    			link1.$$.fragment.c();
    			t1 = space();
    			a = element("a");
    			t2 = text(t2_value);
    			t3 = space();
    			if (if_block) if_block.c();
    			this.h();
    		},

    		l: function claim(nodes) {
    			div2 = claim_element(nodes, "DIV", { class: true }, false);
    			var div2_nodes = children(div2);

    			div1 = claim_element(div2_nodes, "DIV", { class: true }, false);
    			var div1_nodes = children(div1);

    			div0 = claim_element(div1_nodes, "DIV", { class: true }, false);
    			var div0_nodes = children(div0);

    			article = claim_element(div0_nodes, "ARTICLE", { class: true }, false);
    			var article_nodes = children(article);

    			h2 = claim_element(article_nodes, "H2", { class: true }, false);
    			var h2_nodes = children(h2);

    			link0.$$.fragment.l(h2_nodes);
    			h2_nodes.forEach(detach);
    			t0 = claim_text(article_nodes, "\n\n            \n                ");

    			p = claim_element(article_nodes, "P", { class: true }, false);
    			var p_nodes = children(p);

    			link1.$$.fragment.l(p_nodes);
    			p_nodes.forEach(detach);
    			article_nodes.forEach(detach);
    			t1 = claim_text(div0_nodes, "\n\n                ");

    			a = claim_element(div0_nodes, "A", { target: true, class: true, href: true, title: true }, false);
    			var a_nodes = children(a);

    			t2 = claim_text(a_nodes, t2_value);
    			a_nodes.forEach(detach);
    			div0_nodes.forEach(detach);
    			t3 = claim_text(div1_nodes, "\n\n        ");
    			if (if_block) if_block.l(div1_nodes);
    			div1_nodes.forEach(detach);
    			div2_nodes.forEach(detach);
    			this.h();
    		},

    		h: function hydrate() {
    			attr(h2, "class", "post-item-header svelte-1wx1il9");
    			add_location(h2, file$3, 15, 16, 251);
    			attr(p, "class", "post-item-summary svelte-1wx1il9");
    			add_location(p, file$3, 22, 16, 475);
    			attr(article, "class", "post-item-article");
    			add_location(article, file$3, 14, 12, 199);
    			attr(a, "target", "_blank");
    			attr(a, "class", "author svelte-1wx1il9");
    			attr(a, "href", a_href_value = `https://pixly.app/user/${ctx.post.author.username}`);
    			attr(a, "title", "Pixly Page");
    			add_location(a, file$3, 29, 16, 709);
    			attr(div0, "class", "text-box svelte-1wx1il9");
    			add_location(div0, file$3, 13, 8, 164);
    			attr(div1, "class", "top-box svelte-1wx1il9");
    			add_location(div1, file$3, 12, 4, 134);
    			attr(div2, "class", "message-box svelte-1wx1il9");
    			add_location(div2, file$3, 10, 0, 103);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div1);
    			append(div1, div0);
    			append(div0, article);
    			append(article, h2);
    			mount_component(link0, h2, null);
    			append(article, t0);
    			append(article, p);
    			mount_component(link1, p, null);
    			append(div0, t1);
    			append(div0, a);
    			append(a, t2);
    			append(div1, t3);
    			if (if_block) if_block.m(div1, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var link0_changes = {};
    			if (changed.post) link0_changes.to = `/post/${ctx.post.slug}`;
    			if (changed.post) link0_changes.state = {id:ctx.post.id};
    			if (changed.$$scope || changed.post) link0_changes.$$scope = { changed, ctx };
    			link0.$set(link0_changes);

    			var link1_changes = {};
    			if (changed.post) link1_changes.to = `/post/${ctx.post.slug}`;
    			if (changed.post) link1_changes.state = {id:ctx.post.id};
    			if (changed.$$scope || changed.post) link1_changes.$$scope = { changed, ctx };
    			link1.$set(link1_changes);

    			if ((!current || changed.post) && t2_value !== (t2_value = ctx.post.author.name)) {
    				set_data(t2, t2_value);
    			}

    			if ((!current || changed.post) && a_href_value !== (a_href_value = `https://pixly.app/user/${ctx.post.author.username}`)) {
    				attr(a, "href", a_href_value);
    			}

    			if (ctx.post.image) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);

    			transition_in(link1.$$.fragment, local);

    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			destroy_component(link0);

    			destroy_component(link1);

    			if (if_block) if_block.d();
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { post } = $$props;

    	const writable_props = ['post'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<PostItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('post' in $$props) $$invalidate('post', post = $$props.post);
    	};

    	return { post };
    }

    class PostItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$5, safe_not_equal, ["post"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.post === undefined && !('post' in props)) {
    			console.warn("<PostItem> was created without expected prop 'post'");
    		}
    	}

    	get post() {
    		throw new Error("<PostItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set post(value) {
    		throw new Error("<PostItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var types = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var ClientError = /** @class */ (function (_super) {
        __extends(ClientError, _super);
        function ClientError(response, request) {
            var _this = this;
            var message = ClientError.extractMessage(response) + ": " + JSON.stringify({ response: response, request: request });
            _this = _super.call(this, message) || this;
            _this.response = response;
            _this.request = request;
            // this is needed as Safari doesn't support .captureStackTrace
            /* tslint:disable-next-line */
            if (typeof Error.captureStackTrace === 'function') {
                Error.captureStackTrace(_this, ClientError);
            }
            return _this;
        }
        ClientError.extractMessage = function (response) {
            try {
                return response.errors[0].message;
            }
            catch (e) {
                return "GraphQL Error (Code: " + response.status + ")";
            }
        };
        return ClientError;
    }(Error));
    exports.ClientError = ClientError;
    //# sourceMappingURL=types.js.map
    });

    unwrapExports(types);
    var types_1 = types.ClientError;

    (function(self) {

      if (self.fetch) {
        return
      }

      var support = {
        searchParams: 'URLSearchParams' in self,
        iterable: 'Symbol' in self && 'iterator' in Symbol,
        blob: 'FileReader' in self && 'Blob' in self && (function() {
          try {
            new Blob();
            return true
          } catch(e) {
            return false
          }
        })(),
        formData: 'FormData' in self,
        arrayBuffer: 'ArrayBuffer' in self
      };

      if (support.arrayBuffer) {
        var viewClasses = [
          '[object Int8Array]',
          '[object Uint8Array]',
          '[object Uint8ClampedArray]',
          '[object Int16Array]',
          '[object Uint16Array]',
          '[object Int32Array]',
          '[object Uint32Array]',
          '[object Float32Array]',
          '[object Float64Array]'
        ];

        var isDataView = function(obj) {
          return obj && DataView.prototype.isPrototypeOf(obj)
        };

        var isArrayBufferView = ArrayBuffer.isView || function(obj) {
          return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
        };
      }

      function normalizeName(name) {
        if (typeof name !== 'string') {
          name = String(name);
        }
        if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
          throw new TypeError('Invalid character in header field name')
        }
        return name.toLowerCase()
      }

      function normalizeValue(value) {
        if (typeof value !== 'string') {
          value = String(value);
        }
        return value
      }

      // Build a destructive iterator for the value list
      function iteratorFor(items) {
        var iterator = {
          next: function() {
            var value = items.shift();
            return {done: value === undefined, value: value}
          }
        };

        if (support.iterable) {
          iterator[Symbol.iterator] = function() {
            return iterator
          };
        }

        return iterator
      }

      function Headers(headers) {
        this.map = {};

        if (headers instanceof Headers) {
          headers.forEach(function(value, name) {
            this.append(name, value);
          }, this);
        } else if (Array.isArray(headers)) {
          headers.forEach(function(header) {
            this.append(header[0], header[1]);
          }, this);
        } else if (headers) {
          Object.getOwnPropertyNames(headers).forEach(function(name) {
            this.append(name, headers[name]);
          }, this);
        }
      }

      Headers.prototype.append = function(name, value) {
        name = normalizeName(name);
        value = normalizeValue(value);
        var oldValue = this.map[name];
        this.map[name] = oldValue ? oldValue+','+value : value;
      };

      Headers.prototype['delete'] = function(name) {
        delete this.map[normalizeName(name)];
      };

      Headers.prototype.get = function(name) {
        name = normalizeName(name);
        return this.has(name) ? this.map[name] : null
      };

      Headers.prototype.has = function(name) {
        return this.map.hasOwnProperty(normalizeName(name))
      };

      Headers.prototype.set = function(name, value) {
        this.map[normalizeName(name)] = normalizeValue(value);
      };

      Headers.prototype.forEach = function(callback, thisArg) {
        for (var name in this.map) {
          if (this.map.hasOwnProperty(name)) {
            callback.call(thisArg, this.map[name], name, this);
          }
        }
      };

      Headers.prototype.keys = function() {
        var items = [];
        this.forEach(function(value, name) { items.push(name); });
        return iteratorFor(items)
      };

      Headers.prototype.values = function() {
        var items = [];
        this.forEach(function(value) { items.push(value); });
        return iteratorFor(items)
      };

      Headers.prototype.entries = function() {
        var items = [];
        this.forEach(function(value, name) { items.push([name, value]); });
        return iteratorFor(items)
      };

      if (support.iterable) {
        Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
      }

      function consumed(body) {
        if (body.bodyUsed) {
          return Promise.reject(new TypeError('Already read'))
        }
        body.bodyUsed = true;
      }

      function fileReaderReady(reader) {
        return new Promise(function(resolve, reject) {
          reader.onload = function() {
            resolve(reader.result);
          };
          reader.onerror = function() {
            reject(reader.error);
          };
        })
      }

      function readBlobAsArrayBuffer(blob) {
        var reader = new FileReader();
        var promise = fileReaderReady(reader);
        reader.readAsArrayBuffer(blob);
        return promise
      }

      function readBlobAsText(blob) {
        var reader = new FileReader();
        var promise = fileReaderReady(reader);
        reader.readAsText(blob);
        return promise
      }

      function readArrayBufferAsText(buf) {
        var view = new Uint8Array(buf);
        var chars = new Array(view.length);

        for (var i = 0; i < view.length; i++) {
          chars[i] = String.fromCharCode(view[i]);
        }
        return chars.join('')
      }

      function bufferClone(buf) {
        if (buf.slice) {
          return buf.slice(0)
        } else {
          var view = new Uint8Array(buf.byteLength);
          view.set(new Uint8Array(buf));
          return view.buffer
        }
      }

      function Body() {
        this.bodyUsed = false;

        this._initBody = function(body) {
          this._bodyInit = body;
          if (!body) {
            this._bodyText = '';
          } else if (typeof body === 'string') {
            this._bodyText = body;
          } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
            this._bodyBlob = body;
          } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
            this._bodyFormData = body;
          } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
            this._bodyText = body.toString();
          } else if (support.arrayBuffer && support.blob && isDataView(body)) {
            this._bodyArrayBuffer = bufferClone(body.buffer);
            // IE 10-11 can't handle a DataView body.
            this._bodyInit = new Blob([this._bodyArrayBuffer]);
          } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
            this._bodyArrayBuffer = bufferClone(body);
          } else {
            throw new Error('unsupported BodyInit type')
          }

          if (!this.headers.get('content-type')) {
            if (typeof body === 'string') {
              this.headers.set('content-type', 'text/plain;charset=UTF-8');
            } else if (this._bodyBlob && this._bodyBlob.type) {
              this.headers.set('content-type', this._bodyBlob.type);
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
              this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
            }
          }
        };

        if (support.blob) {
          this.blob = function() {
            var rejected = consumed(this);
            if (rejected) {
              return rejected
            }

            if (this._bodyBlob) {
              return Promise.resolve(this._bodyBlob)
            } else if (this._bodyArrayBuffer) {
              return Promise.resolve(new Blob([this._bodyArrayBuffer]))
            } else if (this._bodyFormData) {
              throw new Error('could not read FormData body as blob')
            } else {
              return Promise.resolve(new Blob([this._bodyText]))
            }
          };

          this.arrayBuffer = function() {
            if (this._bodyArrayBuffer) {
              return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
            } else {
              return this.blob().then(readBlobAsArrayBuffer)
            }
          };
        }

        this.text = function() {
          var rejected = consumed(this);
          if (rejected) {
            return rejected
          }

          if (this._bodyBlob) {
            return readBlobAsText(this._bodyBlob)
          } else if (this._bodyArrayBuffer) {
            return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
          } else if (this._bodyFormData) {
            throw new Error('could not read FormData body as text')
          } else {
            return Promise.resolve(this._bodyText)
          }
        };

        if (support.formData) {
          this.formData = function() {
            return this.text().then(decode)
          };
        }

        this.json = function() {
          return this.text().then(JSON.parse)
        };

        return this
      }

      // HTTP methods whose capitalization should be normalized
      var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

      function normalizeMethod(method) {
        var upcased = method.toUpperCase();
        return (methods.indexOf(upcased) > -1) ? upcased : method
      }

      function Request(input, options) {
        options = options || {};
        var body = options.body;

        if (input instanceof Request) {
          if (input.bodyUsed) {
            throw new TypeError('Already read')
          }
          this.url = input.url;
          this.credentials = input.credentials;
          if (!options.headers) {
            this.headers = new Headers(input.headers);
          }
          this.method = input.method;
          this.mode = input.mode;
          if (!body && input._bodyInit != null) {
            body = input._bodyInit;
            input.bodyUsed = true;
          }
        } else {
          this.url = String(input);
        }

        this.credentials = options.credentials || this.credentials || 'omit';
        if (options.headers || !this.headers) {
          this.headers = new Headers(options.headers);
        }
        this.method = normalizeMethod(options.method || this.method || 'GET');
        this.mode = options.mode || this.mode || null;
        this.referrer = null;

        if ((this.method === 'GET' || this.method === 'HEAD') && body) {
          throw new TypeError('Body not allowed for GET or HEAD requests')
        }
        this._initBody(body);
      }

      Request.prototype.clone = function() {
        return new Request(this, { body: this._bodyInit })
      };

      function decode(body) {
        var form = new FormData();
        body.trim().split('&').forEach(function(bytes) {
          if (bytes) {
            var split = bytes.split('=');
            var name = split.shift().replace(/\+/g, ' ');
            var value = split.join('=').replace(/\+/g, ' ');
            form.append(decodeURIComponent(name), decodeURIComponent(value));
          }
        });
        return form
      }

      function parseHeaders(rawHeaders) {
        var headers = new Headers();
        // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
        // https://tools.ietf.org/html/rfc7230#section-3.2
        var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
        preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
          var parts = line.split(':');
          var key = parts.shift().trim();
          if (key) {
            var value = parts.join(':').trim();
            headers.append(key, value);
          }
        });
        return headers
      }

      Body.call(Request.prototype);

      function Response(bodyInit, options) {
        if (!options) {
          options = {};
        }

        this.type = 'default';
        this.status = options.status === undefined ? 200 : options.status;
        this.ok = this.status >= 200 && this.status < 300;
        this.statusText = 'statusText' in options ? options.statusText : 'OK';
        this.headers = new Headers(options.headers);
        this.url = options.url || '';
        this._initBody(bodyInit);
      }

      Body.call(Response.prototype);

      Response.prototype.clone = function() {
        return new Response(this._bodyInit, {
          status: this.status,
          statusText: this.statusText,
          headers: new Headers(this.headers),
          url: this.url
        })
      };

      Response.error = function() {
        var response = new Response(null, {status: 0, statusText: ''});
        response.type = 'error';
        return response
      };

      var redirectStatuses = [301, 302, 303, 307, 308];

      Response.redirect = function(url, status) {
        if (redirectStatuses.indexOf(status) === -1) {
          throw new RangeError('Invalid status code')
        }

        return new Response(null, {status: status, headers: {location: url}})
      };

      self.Headers = Headers;
      self.Request = Request;
      self.Response = Response;

      self.fetch = function(input, init) {
        return new Promise(function(resolve, reject) {
          var request = new Request(input, init);
          var xhr = new XMLHttpRequest();

          xhr.onload = function() {
            var options = {
              status: xhr.status,
              statusText: xhr.statusText,
              headers: parseHeaders(xhr.getAllResponseHeaders() || '')
            };
            options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
            var body = 'response' in xhr ? xhr.response : xhr.responseText;
            resolve(new Response(body, options));
          };

          xhr.onerror = function() {
            reject(new TypeError('Network request failed'));
          };

          xhr.ontimeout = function() {
            reject(new TypeError('Network request failed'));
          };

          xhr.open(request.method, request.url, true);

          if (request.credentials === 'include') {
            xhr.withCredentials = true;
          } else if (request.credentials === 'omit') {
            xhr.withCredentials = false;
          }

          if ('responseType' in xhr && support.blob) {
            xhr.responseType = 'blob';
          }

          request.headers.forEach(function(value, name) {
            xhr.setRequestHeader(name, value);
          });

          xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
        })
      };
      self.fetch.polyfill = true;
    })(typeof self !== 'undefined' ? self : undefined);

    var src = createCommonjsModule(function (module, exports) {
    var __assign = (commonjsGlobal && commonjsGlobal.__assign) || Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (commonjsGlobal && commonjsGlobal.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [0, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var __rest = (commonjsGlobal && commonjsGlobal.__rest) || function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
                t[p[i]] = s[p[i]];
        return t;
    };
    Object.defineProperty(exports, "__esModule", { value: true });

    var types_2 = types;
    exports.ClientError = types_2.ClientError;

    var GraphQLClient = /** @class */ (function () {
        function GraphQLClient(url, options) {
            this.url = url;
            this.options = options || {};
        }
        GraphQLClient.prototype.rawRequest = function (query, variables) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, headers, others, body, response, result, headers_1, status_1, errorResult;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = this.options, headers = _a.headers, others = __rest(_a, ["headers"]);
                            body = JSON.stringify({
                                query: query,
                                variables: variables ? variables : undefined,
                            });
                            return [4 /*yield*/, fetch(this.url, __assign({ method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, headers), body: body }, others))];
                        case 1:
                            response = _b.sent();
                            return [4 /*yield*/, getResult(response)];
                        case 2:
                            result = _b.sent();
                            if (response.ok && !result.errors && result.data) {
                                headers_1 = response.headers, status_1 = response.status;
                                return [2 /*return*/, __assign({}, result, { headers: headers_1, status: status_1 })];
                            }
                            else {
                                errorResult = typeof result === 'string' ? { error: result } : result;
                                throw new types.ClientError(__assign({}, errorResult, { status: response.status, headers: response.headers }), { query: query, variables: variables });
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        GraphQLClient.prototype.request = function (query, variables) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, headers, others, body, response, result, errorResult;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = this.options, headers = _a.headers, others = __rest(_a, ["headers"]);
                            body = JSON.stringify({
                                query: query,
                                variables: variables ? variables : undefined,
                            });
                            return [4 /*yield*/, fetch(this.url, __assign({ method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, headers), body: body }, others))];
                        case 1:
                            response = _b.sent();
                            return [4 /*yield*/, getResult(response)];
                        case 2:
                            result = _b.sent();
                            if (response.ok && !result.errors && result.data) {
                                return [2 /*return*/, result.data];
                            }
                            else {
                                errorResult = typeof result === 'string' ? { error: result } : result;
                                throw new types.ClientError(__assign({}, errorResult, { status: response.status }), { query: query, variables: variables });
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        GraphQLClient.prototype.setHeaders = function (headers) {
            this.options.headers = headers;
            return this;
        };
        GraphQLClient.prototype.setHeader = function (key, value) {
            var headers = this.options.headers;
            if (headers) {
                headers[key] = value;
            }
            else {
                this.options.headers = (_a = {}, _a[key] = value, _a);
            }
            return this;
            var _a;
        };
        return GraphQLClient;
    }());
    exports.GraphQLClient = GraphQLClient;
    function rawRequest(url, query, variables) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                client = new GraphQLClient(url);
                return [2 /*return*/, client.rawRequest(query, variables)];
            });
        });
    }
    exports.rawRequest = rawRequest;
    function request(url, query, variables) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                client = new GraphQLClient(url);
                return [2 /*return*/, client.request(query, variables)];
            });
        });
    }
    exports.request = request;
    exports.default = request;
    function getResult(response) {
        return __awaiter(this, void 0, void 0, function () {
            var contentType;
            return __generator(this, function (_a) {
                contentType = response.headers.get('Content-Type');
                if (contentType && contentType.startsWith('application/json')) {
                    return [2 /*return*/, response.json()];
                }
                else {
                    return [2 /*return*/, response.text()];
                }
                return [2 /*return*/];
            });
        });
    }
    //# sourceMappingURL=index.js.map
    });

    unwrapExports(src);
    var src_1 = src.ClientError;
    var src_2 = src.GraphQLClient;
    var src_3 = src.rawRequest;
    var src_4 = src.request;

    // ... or create a GraphQL client instance to send requests
    //const client = new GraphQLClient("https://blog.pixly.app/graphql", { headers: {} })
    //client.request(query, variables).then(data => console.log(data))


    async function blogRequest(page) {
        const endpoint = "https://blog.pixly.app/graphql";
    	if(!page){
    		page = 1;
    	}
    	const first = 20;
    	const skip = (page - 1) * 20;

    	const client = new src_2(endpoint, {
            headers: {},
        });

        const BLOG_QUERY = `query blogPosts($first: Int, $skip: Int) {
        blogPosts(first: $first, skip: $skip) {
			id, header, summary, image,  text, slug,  postType, createdAt, updatedAt,
			author{
				username, name
			},
			tag{
				customId,
				movielensId,
			}
        }
    }`;
        const data = await client.request(BLOG_QUERY, {first, skip});
        //console.log("blog query data: ",data)
        // Add aws s3 prefix to image, cant be done on server
        if (data){
            data.blogPosts.forEach(
                p => p.imageUrl = "https://cbs-static.s3.amazonaws.com/static/media/" + p.image
    		);
    	}
    	//Update local store
    	if (data && data.blogPosts){
    		//console.log("data bp:", data.blogPosts)
    		data.blogPosts.forEach(p => {
    			var newPost = {};
    			newPost[p.id] = p;
    			Store.update(s  => ({...s, ...newPost}) );
    		});
    	}
    	console.log(data);

        return data
    }

    async function postRequestBySlug(slug) {
    	const endpoint = "https://blog.pixly.app/graphql";

    	const client = new src_2(endpoint, {
    		headers: {},
    	});

    	const POST_QUERY = `query post($id: Int, $slug: String) {
    post(id: $id, slug: $slug) {
		id, header, summary, image,  text, slug,  postType, createdAt, updatedAt,
		author{
			username, name
		},
		tag{
			customId,
			movielensId,
		}
    }
  }`;
    	const data = await client.request(POST_QUERY, { slug });
    	//console.log("post query data: ", data)
    	// Add aws s3 prefix to image, cant be done on server
    	//Update local store
        if (data && data.post){
    		data.post.imageUrl = "https://cbs-static.s3.amazonaws.com/static/media/" + data.post.image;
    	}
    	if (data && data.post) {
    		//console.log("post query data.post:", data.post)
    		const newPost = {};
    		newPost[data.post.id] = data.post;
    		Store.update(s => ({ ...s, ...newPost }));
    	}
    	if (data && data.post) return data.post
    	return data.post
    }

    /*

    	new Promise(resolve => {
    		setTimeout(() => {
    			const queryResults = movies.filter(movie => movie.name.toLowerCase().includes(input));
    			//console.log("result returned", result)
    			resolve(queryResults)
    		}, 300)
    	});
    */

    const Store = writable({});

    let localstore;
    Store.subscribe(value => {
        localstore = value;
    });


    // Get Post whether its in the store or in the server
    async function getPostBySlug(slug){
        //first query store
        var storePost =  getStorePostBySlug(slug);
        if (storePost && storePost.header){
            return storePost
        }
        else{
            const serverPost = await getServerPostBySlug(slug);
            //console.log("serverPost", serverPost)
            if (serverPost && serverPost.header){
                return serverPost
            }
            ////console.log("sdata", sdata)
            //return sdata
        }
    }
    function getStorePostBySlug(slug){
        Object.keys(localstore).map(key => {
            if (localstore[key].slug === slug){
                //console.log("slug found in store: ", localstore[key])
                return localstore[key]
            }
        });
    }


    // SERVER REQUESTS
    function getServerPostBySlug(slug){
        const post = postRequestBySlug(slug);
        if (post){
            return post
        }
    }

    /* src/pages/BlogPage.svelte generated by Svelte v3.7.1 */
    const { console: console_1 } = globals;

    const file$4 = "src/pages/BlogPage.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.key = list[i];
    	return child_ctx;
    }

    // (25:2) {#if window.location.pathname !== "/"}
    function create_if_block_2(ctx) {
    	var button, t, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			t = text("Back");
    			this.h();
    		},

    		l: function claim(nodes) {
    			button = claim_element(nodes, "BUTTON", { class: true }, false);
    			var button_nodes = children(button);

    			t = claim_text(button_nodes, "Back");
    			button_nodes.forEach(detach);
    			this.h();
    		},

    		h: function hydrate() {
    			attr(button, "class", "back-button");
    			add_location(button, file$4, 25, 3, 638);
    			dispose = listen(button, "click", click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			dispose();
    		}
    	};
    }

    // (32:4) {#if Object.keys(storePosts).length > 0 }
    function create_if_block_1$1(ctx) {
    	var each_1_anchor, current;

    	var each_value = Object.keys(ctx.storePosts);

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		l: function claim(nodes) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(nodes);
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.storePosts) {
    				each_value = Object.keys(ctx.storePosts);

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    // (33:8) {#each Object.keys(storePosts) as key }
    function create_each_block(ctx) {
    	var current;

    	var postitem = new PostItem({
    		props: { post: ctx.storePosts[ctx.key] },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			postitem.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			postitem.$$.fragment.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			mount_component(postitem, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var postitem_changes = {};
    			if (changed.storePosts) postitem_changes.post = ctx.storePosts[ctx.key];
    			postitem.$set(postitem_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(postitem.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(postitem.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(postitem, detaching);
    		}
    	};
    }

    // (38:4) {#if window.location.href.includes("pixly")}
    function create_if_block$2(ctx) {
    	var ins, t0, script, t1;

    	return {
    		c: function create() {
    			ins = element("ins");
    			t0 = space();
    			script = element("script");
    			t1 = text("(adsbygoogle = window.adsbygoogle || []).push({});");
    			this.h();
    		},

    		l: function claim(nodes) {
    			ins = claim_element(nodes, "INS", { class: true, style: true, "data-ad-format": true, "data-ad-layout-key": true, "data-ad-client": true, "data-ad-slot": true }, false);
    			var ins_nodes = children(ins);

    			ins_nodes.forEach(detach);
    			t0 = claim_text(nodes, "\n        ");

    			script = claim_element(nodes, "SCRIPT", {}, false);
    			var script_nodes = children(script);

    			t1 = claim_text(script_nodes, "(adsbygoogle = window.adsbygoogle || []).push({});");
    			script_nodes.forEach(detach);
    			this.h();
    		},

    		h: function hydrate() {
    			attr(ins, "class", "adsbygoogle");
    			set_style(ins, "display", "block");
    			attr(ins, "data-ad-format", "fluid");
    			attr(ins, "data-ad-layout-key", "-f7+5u+4t-da+6l");
    			attr(ins, "data-ad-client", "ca-pub-9259748524746137");
    			attr(ins, "data-ad-slot", "3122895789");
    			add_location(ins, file$4, 38, 8, 971);
    			add_location(script, file$4, 45, 8, 1229);
    		},

    		m: function mount(target, anchor) {
    			insert(target, ins, anchor);
    			insert(target, t0, anchor);
    			insert(target, script, anchor);
    			append(script, t1);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(ins);
    				detach(t0);
    				detach(script);
    			}
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	var div1, div0, t0, t1, current;

    	var if_block0 = (window.location.pathname !== "/") && create_if_block_2();

    	var if_block1 = (Object.keys(ctx.storePosts).length > 0) && create_if_block_1$1(ctx);

    	var if_block2 = (window.location.href.includes("pixly")) && create_if_block$2();

    	return {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			this.h();
    		},

    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true }, false);
    			var div1_nodes = children(div1);

    			div0 = claim_element(div1_nodes, "DIV", { class: true }, false);
    			var div0_nodes = children(div0);

    			if (if_block0) if_block0.l(div0_nodes);
    			div0_nodes.forEach(detach);
    			t0 = claim_text(div1_nodes, "\n\n    ");
    			if (if_block1) if_block1.l(div1_nodes);
    			t1 = claim_text(div1_nodes, "\n\n    ");
    			if (if_block2) if_block2.l(div1_nodes);
    			div1_nodes.forEach(detach);
    			this.h();
    		},

    		h: function hydrate() {
    			attr(div0, "class", "breadcrumb");
    			add_location(div0, file$4, 23, 1, 569);
    			attr(div1, "class", "page-container blog-page svelte-1af3srv");
    			add_location(div1, file$4, 20, 0, 527);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append(div1, t0);
    			if (if_block1) if_block1.m(div1, null);
    			append(div1, t1);
    			if (if_block2) if_block2.m(div1, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (window.location.pathname !== "/") {
    				if (!if_block0) {
    					if_block0 = create_if_block_2();
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (Object.keys(ctx.storePosts).length > 0) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, t1);
    				}
    			} else if (if_block1) {
    				group_outros();
    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});
    				check_outros();
    			}

    			if (window.location.href.includes("pixly")) {
    				if (!if_block2) {
    					if_block2 = create_if_block$2();
    					if_block2.c();
    					if_block2.m(div1, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};
    }

    function click_handler() {
    	return window.history.back();
    }

    function instance$4($$self, $$props, $$invalidate) {
    	

        let { page } = $$props;
    	onMount(() => {
    		//Get Blog posts and update local store
    		blogRequest(page).catch(e => console.log("eee", e.message));
        });
        
        let storePosts;
        const unsubscribe = Store.subscribe(value => {
            $$invalidate('storePosts', storePosts = value);
        });
        //$:postKeys = Object.keys(storePosts)

    	const writable_props = ['page'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1.warn(`<BlogPage> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('page' in $$props) $$invalidate('page', page = $$props.page);
    	};

    	return { page, storePosts };
    }

    class BlogPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$6, safe_not_equal, ["page"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.page === undefined && !('page' in props)) {
    			console_1.warn("<BlogPage> was created without expected prop 'page'");
    		}
    	}

    	get page() {
    		throw new Error("<BlogPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<BlogPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/richdata/PublisherData.svelte generated by Svelte v3.7.1 */

    const file$5 = "src/richdata/PublisherData.svelte";

    function create_fragment$7(ctx) {
    	var div3, div0, meta0, t0, div2, meta1, t1, div1, a, img, t2, meta2;

    	return {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			meta0 = element("meta");
    			t0 = space();
    			div2 = element("div");
    			meta1 = element("meta");
    			t1 = space();
    			div1 = element("div");
    			a = element("a");
    			img = element("img");
    			t2 = space();
    			meta2 = element("meta");
    			this.h();
    		},

    		l: function claim(nodes) {
    			div3 = claim_element(nodes, "DIV", {}, false);
    			var div3_nodes = children(div3);

    			div0 = claim_element(div3_nodes, "DIV", { itemscope: true, itemprop: true, itemtype: true }, false);
    			var div0_nodes = children(div0);

    			meta0 = claim_element(div0_nodes, "META", { content: true }, false);
    			var meta0_nodes = children(meta0);

    			meta0_nodes.forEach(detach);
    			div0_nodes.forEach(detach);
    			t0 = claim_text(div3_nodes, "\n    ");

    			div2 = claim_element(div3_nodes, "DIV", { itemscope: true, itemprop: true, itemtype: true }, false);
    			var div2_nodes = children(div2);

    			meta1 = claim_element(div2_nodes, "META", { itemprop: true, content: true }, false);
    			var meta1_nodes = children(meta1);

    			meta1_nodes.forEach(detach);
    			t1 = claim_text(div2_nodes, "\n        ");

    			div1 = claim_element(div2_nodes, "DIV", { itemscope: true, itemprop: true, itemtype: true, style: true }, false);
    			var div1_nodes = children(div1);

    			a = claim_element(div1_nodes, "A", { href: true, taget: true }, false);
    			var a_nodes = children(a);

    			img = claim_element(a_nodes, "IMG", { alt: true, style: true, src: true }, false);
    			var img_nodes = children(img);

    			img_nodes.forEach(detach);
    			a_nodes.forEach(detach);
    			t2 = claim_text(div1_nodes, "\n            ");

    			meta2 = claim_element(div1_nodes, "META", { itemprop: true, content: true }, false);
    			var meta2_nodes = children(meta2);

    			meta2_nodes.forEach(detach);
    			div1_nodes.forEach(detach);
    			div2_nodes.forEach(detach);
    			div3_nodes.forEach(detach);
    			this.h();
    		},

    		h: function hydrate() {
    			attr(meta0, "content", "https://blog.pixly.app");
    			add_location(meta0, file$5, 18, 8, 507);
    			attr(div0, "itemscope", "");
    			attr(div0, "itemprop", "mainEntityOfPage");
    			attr(div0, "itemtype", "http://schema.org/WebPage");
    			add_location(div0, file$5, 17, 4, 418);
    			attr(meta1, "itemprop", "name");
    			attr(meta1, "content", "pixly");
    			add_location(meta1, file$5, 22, 8, 656);
    			attr(img, "alt", "post image");
    			set_style(img, "width", "45px");
    			set_style(img, "height", "45px");
    			attr(img, "src", "https://cbs-static.s3.eu-west-2.amazonaws.com/static/images/favicon-small.png");
    			add_location(img, file$5, 28, 16, 991);
    			attr(a, "href", "https://pixly.app");
    			attr(a, "taget", "_blank");
    			add_location(a, file$5, 27, 12, 931);
    			attr(meta2, "itemprop", "url");
    			attr(meta2, "content", "https://cbs-static.s3.eu-west-2.amazonaws.com/static/images/favicon-small.png");
    			add_location(meta2, file$5, 34, 12, 1243);
    			attr(div1, "itemscope", "");
    			attr(div1, "itemprop", "logo");
    			attr(div1, "itemtype", "http://schema.org/ImageObject");
    			set_style(div1, "display", "flex");
    			set_style(div1, "flex-direction", "row");
    			set_style(div1, "justify-content", "flex-start");
    			set_style(div1, "align-items", "center");
    			set_style(div1, "margin", "10px 0");
    			add_location(div1, file$5, 23, 8, 704);
    			attr(div2, "itemscope", "");
    			attr(div2, "itemprop", "publisher");
    			attr(div2, "itemtype", "http://schema.org/Organization");
    			add_location(div2, file$5, 21, 4, 569);
    			add_location(div3, file$5, 16, 0, 408);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div0);
    			append(div0, meta0);
    			append(div3, t0);
    			append(div3, div2);
    			append(div2, meta1);
    			append(div2, t1);
    			append(div2, div1);
    			append(div1, a);
    			append(a, img);
    			append(div1, t2);
    			append(div1, meta2);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div3);
    			}
    		}
    	};
    }

    class PublisherData extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$7, safe_not_equal, []);
    	}
    }

    /* src/pages/PostPage.svelte generated by Svelte v3.7.1 */

    const file$6 = "src/pages/PostPage.svelte";

    // (27:4) {#if window.location.href.includes("pixly")}
    function create_if_block_2$1(ctx) {
    	var ins, t0, script, t1;

    	return {
    		c: function create() {
    			ins = element("ins");
    			t0 = space();
    			script = element("script");
    			t1 = text("(adsbygoogle = window.adsbygoogle || []).push({});");
    			this.h();
    		},

    		l: function claim(nodes) {
    			ins = claim_element(nodes, "INS", { class: true, style: true, "data-ad-format": true, "data-ad-layout-key": true, "data-ad-client": true, "data-ad-slot": true }, false);
    			var ins_nodes = children(ins);

    			ins_nodes.forEach(detach);
    			t0 = claim_text(nodes, "\n        ");

    			script = claim_element(nodes, "SCRIPT", {}, false);
    			var script_nodes = children(script);

    			t1 = claim_text(script_nodes, "(adsbygoogle = window.adsbygoogle || []).push({});");
    			script_nodes.forEach(detach);
    			this.h();
    		},

    		h: function hydrate() {
    			attr(ins, "class", "adsbygoogle");
    			set_style(ins, "display", "block");
    			attr(ins, "data-ad-format", "fluid");
    			attr(ins, "data-ad-layout-key", "-f9+5v+4m-d8+7b");
    			attr(ins, "data-ad-client", "ca-pub-9259748524746137");
    			attr(ins, "data-ad-slot", "3942041487");
    			add_location(ins, file$6, 27, 2, 608);
    			add_location(script, file$6, 34, 8, 815);
    		},

    		m: function mount(target, anchor) {
    			insert(target, ins, anchor);
    			insert(target, t0, anchor);
    			insert(target, script, anchor);
    			append(script, t1);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(ins);
    				detach(t0);
    				detach(script);
    			}
    		}
    	};
    }

    // (40:1) {#if post && post.header}
    function create_if_block_1$2(ctx) {
    	var article, section0, h2, t0_value = ctx.post.header, t0, t1, div1, a, div0, t2_value = ctx.post.author.name ? ctx.post.author.name : ctx.post.author.username, t2, a_href_value, t3, meta0, meta0_content_value, t4, meta1, meta1_content_value, t5, meta2, meta2_content_value, t6, p, t7_value = ctx.post.updatedAt.slice(0,10), t7, t8, hr, t9, section1, img, img_src_value, t10, html_tag, raw_value = ctx.post.text, t11, article_itemid_value, current;

    	var publisherdata = new PublisherData({ $$inline: true });

    	return {
    		c: function create() {
    			article = element("article");
    			section0 = element("section");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			a = element("a");
    			div0 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			meta0 = element("meta");
    			t4 = space();
    			meta1 = element("meta");
    			t5 = space();
    			meta2 = element("meta");
    			t6 = space();
    			p = element("p");
    			t7 = text(t7_value);
    			t8 = space();
    			hr = element("hr");
    			t9 = space();
    			section1 = element("section");
    			img = element("img");
    			t10 = space();
    			t11 = space();
    			publisherdata.$$.fragment.c();
    			this.h();
    		},

    		l: function claim(nodes) {
    			article = claim_element(nodes, "ARTICLE", { class: true, itemscope: true, itemtype: true, itemid: true }, false);
    			var article_nodes = children(article);

    			section0 = claim_element(article_nodes, "SECTION", { class: true }, false);
    			var section0_nodes = children(section0);

    			h2 = claim_element(section0_nodes, "H2", { class: true, itemprop: true }, false);
    			var h2_nodes = children(h2);

    			t0 = claim_text(h2_nodes, t0_value);
    			h2_nodes.forEach(detach);
    			t1 = claim_text(section0_nodes, "\n\n\t\t\t");

    			div1 = claim_element(section0_nodes, "DIV", { class: true }, false);
    			var div1_nodes = children(div1);

    			a = claim_element(div1_nodes, "A", { target: true, class: true, href: true }, false);
    			var a_nodes = children(a);

    			div0 = claim_element(a_nodes, "DIV", { itemprop: true, itemtype: true }, false);
    			var div0_nodes = children(div0);

    			t2 = claim_text(div0_nodes, t2_value);
    			div0_nodes.forEach(detach);
    			a_nodes.forEach(detach);
    			t3 = claim_text(div1_nodes, "\n\n\t\t\t\t");

    			meta0 = claim_element(div1_nodes, "META", { itemprop: true, content: true }, false);
    			var meta0_nodes = children(meta0);

    			meta0_nodes.forEach(detach);
    			t4 = claim_text(div1_nodes, "\n\t\t\t\t");

    			meta1 = claim_element(div1_nodes, "META", { itemprop: true, content: true }, false);
    			var meta1_nodes = children(meta1);

    			meta1_nodes.forEach(detach);
    			t5 = claim_text(div1_nodes, "\n\t\t\t\t");

    			meta2 = claim_element(div1_nodes, "META", { itemprop: true, content: true }, false);
    			var meta2_nodes = children(meta2);

    			meta2_nodes.forEach(detach);
    			t6 = claim_text(div1_nodes, "\n\t\t\t\t");

    			p = claim_element(div1_nodes, "P", { class: true, itemprop: true }, false);
    			var p_nodes = children(p);

    			t7 = claim_text(p_nodes, t7_value);
    			p_nodes.forEach(detach);
    			div1_nodes.forEach(detach);
    			section0_nodes.forEach(detach);
    			t8 = claim_text(article_nodes, "\n\n\t\t");

    			hr = claim_element(article_nodes, "HR", { class: true }, false);
    			var hr_nodes = children(hr);

    			hr_nodes.forEach(detach);
    			t9 = claim_text(article_nodes, "\n\n\t\t");

    			section1 = claim_element(article_nodes, "SECTION", { id: true, class: true, itemprop: true }, false);
    			var section1_nodes = children(section1);

    			img = claim_element(section1_nodes, "IMG", { class: true, alt: true, itemtype: true, style: true, itemprop: true, src: true }, false);
    			var img_nodes = children(img);

    			img_nodes.forEach(detach);
    			t10 = claim_text(section1_nodes, "\n\t\t\t");
    			section1_nodes.forEach(detach);
    			t11 = claim_text(article_nodes, "\n\t\t");
    			publisherdata.$$.fragment.l(article_nodes);
    			article_nodes.forEach(detach);
    			this.h();
    		},

    		h: function hydrate() {
    			attr(h2, "class", "post-item-header svelte-1ler1ly");
    			attr(h2, "itemprop", "headline");
    			add_location(h2, file$6, 46, 3, 1118);
    			attr(div0, "itemprop", "author");
    			attr(div0, "itemtype", "http://schema.org/Person");
    			add_location(div0, file$6, 54, 5, 1349);
    			attr(a, "target", "_blank");
    			attr(a, "class", "author underline svelte-1ler1ly");
    			attr(a, "href", a_href_value = `https://pixly.app/user/${ctx.post.author.username}`);
    			add_location(a, file$6, 49, 4, 1219);
    			attr(meta0, "itemprop", "datePublished");
    			attr(meta0, "content", meta0_content_value = ctx.post.updatedAt);
    			add_location(meta0, file$6, 59, 4, 1502);
    			attr(meta1, "itemprop", "dateCreated");
    			attr(meta1, "content", meta1_content_value = ctx.post.createdAt);
    			add_location(meta1, file$6, 60, 4, 1563);
    			attr(meta2, "itemprop", "dateModified");
    			attr(meta2, "content", meta2_content_value = ctx.post.updatedAt);
    			add_location(meta2, file$6, 61, 4, 1622);
    			attr(p, "class", "post-item-date svelte-1ler1ly");
    			attr(p, "itemprop", "datePublished");
    			add_location(p, file$6, 62, 4, 1682);
    			attr(div1, "class", "top-bottom svelte-1ler1ly");
    			add_location(div1, file$6, 48, 3, 1190);
    			attr(section0, "class", "top-box svelte-1ler1ly");
    			add_location(section0, file$6, 45, 2, 1089);
    			attr(hr, "class", "svelte-1ler1ly");
    			add_location(hr, file$6, 66, 2, 1794);
    			attr(img, "class", "structure-image");
    			attr(img, "alt", "post image");
    			attr(img, "itemtype", "http://schema.org/ImageObject");
    			set_style(img, "width", "80%");
    			set_style(img, "height", "300px");
    			set_style(img, "margin-left", "10%");
    			set_style(img, "margin-bottom", "30px");
    			attr(img, "itemprop", "image");
    			attr(img, "src", img_src_value = ctx.post.imageUrl ? ctx.post.imageUrl : `https://cbs-static.s3.amazonaws.com/static/media/${ctx.post.image}`);
    			add_location(img, file$6, 69, 3, 1889);
    			html_tag = new HtmlTag(raw_value, null);
    			attr(section1, "id", "post");
    			attr(section1, "class", "content-box svelte-1ler1ly");
    			attr(section1, "itemprop", "articleBody");
    			add_location(section1, file$6, 68, 2, 1802);
    			attr(article, "class", "message-box svelte-1ler1ly");
    			attr(article, "itemscope", "");
    			attr(article, "itemtype", "http://schema.org/BlogPosting");
    			attr(article, "itemid", article_itemid_value = `https://blog.pixly.app/post/${ctx.post.slug}`);
    			add_location(article, file$6, 41, 1, 946);
    		},

    		m: function mount(target, anchor) {
    			insert(target, article, anchor);
    			append(article, section0);
    			append(section0, h2);
    			append(h2, t0);
    			append(section0, t1);
    			append(section0, div1);
    			append(div1, a);
    			append(a, div0);
    			append(div0, t2);
    			append(div1, t3);
    			append(div1, meta0);
    			append(div1, t4);
    			append(div1, meta1);
    			append(div1, t5);
    			append(div1, meta2);
    			append(div1, t6);
    			append(div1, p);
    			append(p, t7);
    			append(article, t8);
    			append(article, hr);
    			append(article, t9);
    			append(article, section1);
    			append(section1, img);
    			append(section1, t10);
    			html_tag.m(section1);
    			ctx.section1_binding(section1);
    			append(article, t11);
    			mount_component(publisherdata, article, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.post) && t0_value !== (t0_value = ctx.post.header)) {
    				set_data(t0, t0_value);
    			}

    			if ((!current || changed.post) && t2_value !== (t2_value = ctx.post.author.name ? ctx.post.author.name : ctx.post.author.username)) {
    				set_data(t2, t2_value);
    			}

    			if ((!current || changed.post) && a_href_value !== (a_href_value = `https://pixly.app/user/${ctx.post.author.username}`)) {
    				attr(a, "href", a_href_value);
    			}

    			if ((!current || changed.post) && meta0_content_value !== (meta0_content_value = ctx.post.updatedAt)) {
    				attr(meta0, "content", meta0_content_value);
    			}

    			if ((!current || changed.post) && meta1_content_value !== (meta1_content_value = ctx.post.createdAt)) {
    				attr(meta1, "content", meta1_content_value);
    			}

    			if ((!current || changed.post) && meta2_content_value !== (meta2_content_value = ctx.post.updatedAt)) {
    				attr(meta2, "content", meta2_content_value);
    			}

    			if ((!current || changed.post) && t7_value !== (t7_value = ctx.post.updatedAt.slice(0,10))) {
    				set_data(t7, t7_value);
    			}

    			if ((!current || changed.post) && img_src_value !== (img_src_value = ctx.post.imageUrl ? ctx.post.imageUrl : `https://cbs-static.s3.amazonaws.com/static/media/${ctx.post.image}`)) {
    				attr(img, "src", img_src_value);
    			}

    			if ((!current || changed.post) && raw_value !== (raw_value = ctx.post.text)) {
    				html_tag.p(raw_value);
    			}

    			if ((!current || changed.post) && article_itemid_value !== (article_itemid_value = `https://blog.pixly.app/post/${ctx.post.slug}`)) {
    				attr(article, "itemid", article_itemid_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(publisherdata.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(publisherdata.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(article);
    			}

    			ctx.section1_binding(null);

    			destroy_component(publisherdata);
    		}
    	};
    }

    // (86:2) {#if window.location.pathname !== "/"}
    function create_if_block$3(ctx) {
    	var span, svg, path, t, dispose;

    	return {
    		c: function create() {
    			span = element("span");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t = text("\n\t\t\t\tBACK");
    			this.h();
    		},

    		l: function claim(nodes) {
    			span = claim_element(nodes, "SPAN", {}, false);
    			var span_nodes = children(span);

    			svg = claim_element(span_nodes, "svg", { "aria-hidden": true, focusable: true, "data-prefix": true, "data-icon": true, class: true, role: true, xmlns: true, viewBox: true }, true);
    			var svg_nodes = children(svg);

    			path = claim_element(svg_nodes, "path", { fill: true, d: true }, true);
    			var path_nodes = children(path);

    			path_nodes.forEach(detach);
    			svg_nodes.forEach(detach);
    			t = claim_text(span_nodes, "\n\t\t\t\tBACK");
    			span_nodes.forEach(detach);
    			this.h();
    		},

    		h: function hydrate() {
    			attr(path, "fill", "currentColor");
    			attr(path, "d", "M134.059 296H436c6.627 0 12-5.373 12-12v-56c0-6.627-5.373-12-12-12H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.569 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296z");
    			add_location(path, file$6, 92, 5, 2600);
    			attr(svg, "aria-hidden", "true");
    			attr(svg, "focusable", "false");
    			attr(svg, "data-prefix", "fas");
    			attr(svg, "data-icon", "long-arrow-alt-left");
    			attr(svg, "class", "left-arrow");
    			attr(svg, "role", "img");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "viewBox", "0 0 448 512");
    			add_location(svg, file$6, 87, 4, 2392);
    			add_location(span, file$6, 86, 3, 2343);
    			dispose = listen(span, "click", click_handler$1);
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    			append(span, svg);
    			append(svg, path);
    			append(span, t);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}

    			dispose();
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	var div1, t0, t1, div0, current;

    	var if_block0 = (window.location.href.includes("pixly")) && create_if_block_2$1();

    	var if_block1 = (ctx.post && ctx.post.header) && create_if_block_1$2(ctx);

    	var if_block2 = (window.location.pathname !== "/") && create_if_block$3();

    	return {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div0 = element("div");
    			if (if_block2) if_block2.c();
    			this.h();
    		},

    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true }, false);
    			var div1_nodes = children(div1);

    			if (if_block0) if_block0.l(div1_nodes);
    			t0 = claim_text(div1_nodes, "\n\n\t");
    			if (if_block1) if_block1.l(div1_nodes);
    			t1 = claim_text(div1_nodes, "\n\n\t");

    			div0 = claim_element(div1_nodes, "DIV", { class: true }, false);
    			var div0_nodes = children(div0);

    			if (if_block2) if_block2.l(div0_nodes);
    			div0_nodes.forEach(detach);
    			div1_nodes.forEach(detach);
    			this.h();
    		},

    		h: function hydrate() {
    			attr(div0, "class", "breadcrumb");
    			add_location(div0, file$6, 84, 1, 2274);
    			attr(div1, "class", "page-container");
    			add_location(div1, file$6, 25, 0, 528);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append(div1, t0);
    			if (if_block1) if_block1.m(div1, null);
    			append(div1, t1);
    			append(div1, div0);
    			if (if_block2) if_block2.m(div0, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (window.location.href.includes("pixly")) {
    				if (!if_block0) {
    					if_block0 = create_if_block_2$1();
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (ctx.post && ctx.post.header) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_1$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, t1);
    				}
    			} else if (if_block1) {
    				group_outros();
    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});
    				check_outros();
    			}

    			if (window.location.pathname !== "/") {
    				if (!if_block2) {
    					if_block2 = create_if_block$3();
    					if_block2.c();
    					if_block2.m(div0, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};
    }

    function click_handler$1() {
    	return window.history.back();
    }

    function instance$5($$self, $$props, $$invalidate) {
    	
    	
    	let { slug } = $$props;
    	let postBody;

    	let post;
    	onMount(async () => {
    		$$invalidate('post', post = await getPostBySlug(slug));
    		//console.log("onmount:", post)
    	});
    	/*
    	*/

    	const writable_props = ['slug'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<PostPage> was created with unknown prop '${key}'`);
    	});

    	function section1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('postBody', postBody = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('slug' in $$props) $$invalidate('slug', slug = $$props.slug);
    	};

    	return { slug, postBody, post, section1_binding };
    }

    class PostPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$8, safe_not_equal, ["slug"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.slug === undefined && !('slug' in props)) {
    			console.warn("<PostPage> was created without expected prop 'slug'");
    		}
    	}

    	get slug() {
    		throw new Error("<PostPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set slug(value) {
    		throw new Error("<PostPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.7.1 */

    const file$7 = "src/App.svelte";

    // (28:2) <Router>
    function create_default_slot$1(ctx) {
    	var t0, main, t1, t2, t3, t4, current;

    	var navbar = new Navbar({ $$inline: true });

    	var route0 = new Route({
    		props: {
    		path: "post/:slug",
    		component: PostPage
    	},
    		$$inline: true
    	});

    	var route1 = new Route({
    		props: { path: "/:page", component: BlogPage },
    		$$inline: true
    	});

    	var route2 = new Route({
    		props: { path: "blog", component: BlogPage },
    		$$inline: true
    	});

    	var route3 = new Route({
    		props: { path: "/", component: BlogPage },
    		$$inline: true
    	});

    	var footer = new Footer({ $$inline: true });

    	return {
    		c: function create() {
    			navbar.$$.fragment.c();
    			t0 = space();
    			main = element("main");
    			route0.$$.fragment.c();
    			t1 = space();
    			route1.$$.fragment.c();
    			t2 = space();
    			route2.$$.fragment.c();
    			t3 = space();
    			route3.$$.fragment.c();
    			t4 = space();
    			footer.$$.fragment.c();
    			this.h();
    		},

    		l: function claim(nodes) {
    			navbar.$$.fragment.l(nodes);
    			t0 = claim_text(nodes, "\n\t\t");

    			main = claim_element(nodes, "MAIN", { class: true }, false);
    			var main_nodes = children(main);

    			route0.$$.fragment.l(main_nodes);
    			t1 = claim_text(main_nodes, "\n\t\t\t");
    			route1.$$.fragment.l(main_nodes);
    			t2 = claim_text(main_nodes, "\n\t\t\t");
    			route2.$$.fragment.l(main_nodes);
    			t3 = claim_text(main_nodes, "\n\t\t\t");
    			route3.$$.fragment.l(main_nodes);
    			main_nodes.forEach(detach);
    			t4 = claim_text(nodes, "\n\t");
    			footer.$$.fragment.l(nodes);
    			this.h();
    		},

    		h: function hydrate() {
    			attr(main, "class", "main-content-container svelte-zy96l");
    			add_location(main, file$7, 29, 2, 871);
    		},

    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, main, anchor);
    			mount_component(route0, main, null);
    			append(main, t1);
    			mount_component(route1, main, null);
    			append(main, t2);
    			mount_component(route2, main, null);
    			append(main, t3);
    			mount_component(route3, main, null);
    			insert(target, t4, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var route0_changes = {};
    			if (changed.PostPage) route0_changes.component = PostPage;
    			route0.$set(route0_changes);

    			var route1_changes = {};
    			if (changed.BlogPage) route1_changes.component = BlogPage;
    			route1.$set(route1_changes);

    			var route2_changes = {};
    			if (changed.BlogPage) route2_changes.component = BlogPage;
    			route2.$set(route2_changes);

    			var route3_changes = {};
    			if (changed.BlogPage) route3_changes.component = BlogPage;
    			route3.$set(route3_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);

    			transition_in(route0.$$.fragment, local);

    			transition_in(route1.$$.fragment, local);

    			transition_in(route2.$$.fragment, local);

    			transition_in(route3.$$.fragment, local);

    			transition_in(footer.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);

    			if (detaching) {
    				detach(t0);
    				detach(main);
    			}

    			destroy_component(route0);

    			destroy_component(route1);

    			destroy_component(route2);

    			destroy_component(route3);

    			if (detaching) {
    				detach(t4);
    			}

    			destroy_component(footer, detaching);
    		}
    	};
    }

    function create_fragment$9(ctx) {
    	var div, meta0, t0, meta1, t1, meta2, t2, links_action, current;

    	var router = new Router({
    		props: {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div = element("div");
    			meta0 = element("meta");
    			t0 = space();
    			meta1 = element("meta");
    			t1 = space();
    			meta2 = element("meta");
    			t2 = space();
    			router.$$.fragment.c();
    			this.h();
    		},

    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true, itemscope: true, itemtype: true }, false);
    			var div_nodes = children(div);

    			meta0 = claim_element(div_nodes, "META", { itemprop: true, content: true }, false);
    			var meta0_nodes = children(meta0);

    			meta0_nodes.forEach(detach);
    			t0 = claim_text(div_nodes, "\n    ");

    			meta1 = claim_element(div_nodes, "META", { itemprop: true, content: true }, false);
    			var meta1_nodes = children(meta1);

    			meta1_nodes.forEach(detach);
    			t1 = claim_text(div_nodes, "\n    ");

    			meta2 = claim_element(div_nodes, "META", { itemprop: true, content: true }, false);
    			var meta2_nodes = children(meta2);

    			meta2_nodes.forEach(detach);
    			t2 = claim_text(div_nodes, "\n\n  ");
    			router.$$.fragment.l(div_nodes);
    			div_nodes.forEach(detach);
    			this.h();
    		},

    		h: function hydrate() {
    			attr(meta0, "itemprop", "about");
    			attr(meta0, "content", "Tech and Cinema posts written by official pixly members.");
    			add_location(meta0, file$7, 23, 4, 662);
    			attr(meta1, "itemprop", "genre");
    			attr(meta1, "content", "Tech");
    			add_location(meta1, file$7, 24, 4, 759);
    			attr(meta2, "itemprop", "genre");
    			attr(meta2, "content", "Cinema");
    			add_location(meta2, file$7, 25, 4, 803);
    			attr(div, "class", "App svelte-zy96l");
    			attr(div, "itemscope", "");
    			attr(div, "itemtype", "http://schema.org/Blog");
    			add_location(div, file$7, 22, 0, 585);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, meta0);
    			append(div, t0);
    			append(div, meta1);
    			append(div, t1);
    			append(div, meta2);
    			append(div, t2);
    			mount_component(router, div, null);
    			links_action = links.call(null, div) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var router_changes = {};
    			if (changed.$$scope) router_changes.$$scope = { changed, ctx };
    			router.$set(router_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(router);

    			if (links_action && typeof links_action.destroy === 'function') links_action.destroy();
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const unsubscribe = Store.subscribe(value => {
    	});

    	let pathname;

    	pathname = window.location.pathname;

    	return {};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$9, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.getElementById('pixly'),
    	hydrate: true
    });

    return app;

}));
