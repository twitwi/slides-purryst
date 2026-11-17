import { Fragment as e, Teleport as t, computed as n, createApp as r, createBlock as i, createCommentVNode as a, createElementBlock as o, createElementVNode as s, createStaticVNode as c, createTextVNode as l, createVNode as u, defineAsyncComponent as d, defineComponent as f, inject as p, mergeProps as m, nextTick as h, normalizeClass as g, normalizeProps as _, normalizeStyle as v, onMounted as y, onUnmounted as b, onUpdated as x, openBlock as S, provide as C, reactive as w, ref as T, renderList as E, renderSlot as D, resolveDynamicComponent as O, shallowRef as k, toDisplayString as A, unref as j, useSlots as M, vModelText as ee, vShow as te, watch as N, watchEffect as ne, withDirectives as re, withKeys as P, withModifiers as F } from "vue";
//#region \0rolldown/runtime.js
var ie = Object.defineProperty, I = (e, t) => {
	let n = {};
	for (var r in e) ie(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || ie(n, Symbol.toStringTag, { value: "Module" }), n;
}, L = new Set("area base br col embed hr img input link meta param> source track wbr".split(" "));
function R(e) {
	if (e.nodeType === Node.TEXT_NODE) return e.textContent || "";
	if (e.nodeType === Node.COMMENT_NODE) return `<!--${e.textContent}-->`;
	if (e.nodeType !== Node.ELEMENT_NODE) return "";
	let t = e, n = t.tagName.toLowerCase();
	if (n === "sp-notes") return "";
	if (L.has(n)) {
		let e = `<${n}`;
		for (let n = 0; n < t.attributes.length; n++) {
			let r = t.attributes[n];
			e += ` ${r.name}="${r.value.replace(/"/g, "&quot;")}"`;
		}
		return e += " >", e;
	}
	let r = `<${n}`;
	for (let e = 0; e < t.attributes.length; e++) {
		let n = t.attributes[e];
		r += ` ${n.name}="${n.value.replace(/"/g, "&quot;")}"`;
	}
	r += ">";
	let i = n === "template" ? t.content.childNodes : t.childNodes;
	for (let e = 0; e < i.length; e++) r += R(i[e]);
	return r += `</${n}>`, r;
}
function ae(e) {
	let t = "";
	for (let n = 0; n < e.childNodes.length; n++) t += R(e.childNodes[n]);
	return t;
}
function oe(e, t) {
	e.querySelectorAll("sp-before").forEach((e) => {
		let n = ae(e).trim();
		n && (t.before = (t.before ?? "") + n);
	}), e.querySelectorAll("sp-after").forEach((e) => {
		let n = ae(e).trim();
		n && (t.after = (t.after ?? "") + n);
	});
}
function se(e) {
	let t = e.querySelectorAll("sp-slide"), n = [];
	return t.forEach((e, t) => {
		let r = ae(e).trim();
		if (!r) return;
		let i = e.getAttribute("notes") ?? void 0;
		if (!i) {
			let t = e.querySelector("sp-notes");
			t && (i = ae(t).trim());
		}
		n.push({
			html: r,
			editableIndex: parseInt(e.getAttribute(":editable-index") || "0", 10),
			num: parseInt(e.getAttribute("num") || "0", 10) || t + 1,
			steps: parseInt(e.getAttribute("steps") || "0", 10),
			transition: e.getAttribute("transition") || "",
			class: e.getAttribute("class") || void 0,
			transitionDuration: e.hasAttribute("transition-duration") ? parseFloat(e.getAttribute("transition-duration")) : void 0,
			noToc: e.hasAttribute("no-toc"),
			fakeEnd: e.hasAttribute("fake-end"),
			sourceFile: e.getAttribute("data-source-file") || void 0,
			sourceLine: (() => {
				let t = e.getAttribute("data-source-line");
				if (t == null) return;
				let n = parseInt(t, 10);
				return Number.isFinite(n) ? n : void 0;
			})(),
			notes: i
		});
	}), n;
}
function ce(e) {
	let t = [], n = 0;
	for (; n < e.length;) {
		let r = e.indexOf("<sp-slide", n);
		if (r === -1) break;
		let i = e.indexOf("</sp-slide>", r);
		if (i === -1) break;
		t.push(e.slice(r, i + 11).trim().replace(/<span[^>]*data-source-file-(?:push|pop)[^>]*><\/span>/g, "")), n = i + 11;
	}
	return t;
}
function le(e) {
	let t = T(e ?? []), r = T(0), i = n(() => t.value[r.value] ?? null), a = n(() => t.value.length);
	function o(e) {
		e >= 0 && e < t.value.length && (r.value = e);
	}
	function s() {
		r.value < t.value.length - 1 && r.value++;
	}
	function c() {
		r.value > 0 && r.value--;
	}
	function l(e) {
		t.value = e;
	}
	return {
		slides: t,
		currentIndex: r,
		current: i,
		total: a,
		goTo: o,
		nextSlide: s,
		prevSlide: c,
		setSlides: l
	};
}
//#endregion
//#region src/sp-api.ts
var z = w({
	navLocked: !1,
	currentIndex: 0,
	stepIndex: 0,
	total: 0,
	effectiveLast: 0,
	effectiveTotal: 0,
	fakeEndIndices: [],
	toggleNavLock: () => {},
	goTo: (e) => {},
	next: () => {},
	prev: () => {},
	nextSlide: () => {},
	prevSlide: () => {},
	export: () => {},
	dragging: !1,
	devServer: !1,
	config: {},
	_animCommands: {},
	_animActionTypes: {},
	overview: !1,
	showChunkletsBar: !1,
	chunkletDefs: [],
	chunkletMode: !1,
	selectedChunklet: null
}), ue = {}, B = /* @__PURE__ */ new Set();
//#endregion
//#region src/animCommands.ts
function V(e) {
	let t = [], n = "", r = null;
	for (let i = 0; i < e.length; i++) {
		let a = e[i];
		r ? a === r ? r = null : n += a : a === "\"" || a === "'" ? r = a : a === "," ? (t.push(n.trim()), n = "") : n += a;
	}
	return t.push(n.trim()), t;
}
var H = {
	show: {
		apply(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.classList.add("sp-anim-shown"), n.classList.remove("sp-anim-hidden");
		},
		reverse(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.classList.add("sp-anim-hidden"), n.classList.remove("sp-anim-shown");
		},
		init(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.setAttribute("data-sp-animated", "true"), n.classList.add("sp-anim-hidden"), n.classList.remove("sp-anim-shown");
		}
	},
	hide: {
		apply(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.classList.add("sp-anim-hidden"), n.classList.remove("sp-anim-shown");
		},
		reverse(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.classList.add("sp-anim-shown"), n.classList.remove("sp-anim-hidden");
		},
		init(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.setAttribute("data-sp-animated", "true"), n.classList.add("sp-anim-shown"), n.classList.remove("sp-anim-hidden");
		}
	},
	addClass: {
		apply(e, t) {
			t.className;
			for (let n of e.querySelectorAll(t.selector)) n.classList.add(t.className);
		},
		reverse(e, t) {
			if (t.className) for (let n of e.querySelectorAll(t.selector)) n.classList.remove(t.className);
		},
		init(e, t) {
			if (t.className) for (let n of e.querySelectorAll(t.selector)) n.setAttribute("data-sp-animated", "true"), n.classList.remove(t.className);
		}
	},
	removeClass: {
		apply(e, t) {
			if (t.className) for (let n of e.querySelectorAll(t.selector)) n.classList.remove(t.className);
		},
		reverse(e, t) {
			if (t.className) for (let n of e.querySelectorAll(t.selector)) n.classList.add(t.className);
		},
		init(e, t) {
			if (t.className) for (let n of e.querySelectorAll(t.selector)) n.setAttribute("data-sp-animated", "true"), n.classList.add(t.className);
		}
	},
	play: {
		apply(e, t) {
			for (let n of e.querySelectorAll(t.selector)) t.rewind && (n.currentTime = 0), n.play().catch(() => {});
		},
		reverse(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.pause();
		},
		init(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.pause(), n.currentTime = 0;
		}
	},
	pause: {
		apply(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.pause();
		},
		reverse(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.play().catch(() => {});
		},
		init(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.pause();
		}
	},
	viewbox: {
		init(e, t) {
			let n = e.querySelector(t.selector), r = n?.closest("svg");
			if (!n || !r) return;
			if (r.spOriginalViewbox ??= r.getAttribute("viewBox") ?? "", r.spViewboxStack ??= [], r.spInited ??= /* @__PURE__ */ new Set(), !r.spInited.has(t)) {
				let e = fe(r, n);
				e && r.spViewboxStack.push(e), t._viewboxIndex = r.spViewboxStack.length - 1, r.spInited.add(t), r.spIndex = z.stepIndex === 0 ? 0 : r.spViewboxStack.length - 1;
			}
			if (!r.querySelector("& > animate.spViewbox")) {
				let e = de("animate");
				e.setAttribute("class", "spViewbox"), e.setAttribute("attributeName", "viewBox"), e.setAttribute("fill", "freeze"), r.appendChild(e);
			}
			let i = r.querySelector("& > animate.spViewbox");
			i && (i.setAttribute("from", r.spOriginalViewbox), i.setAttribute("to", r.spOriginalViewbox), i.setAttribute("dur", "1s"), i.beginElement());
		},
		apply(e, t, n) {
			let r = e.querySelector(t.selector)?.closest("svg");
			r && pe(r, t._viewboxIndex, n);
		}
	}
};
function de(e) {
	return document.createElementNS("http://www.w3.org/2000/svg", e);
}
function fe(e, t) {
	let [n, r, i, a] = e.spOriginalViewbox.split(/\s+/).map(Number);
	if (!(i > 0) || !(a > 0)) return;
	let o = e.getBoundingClientRect(), s = t.getBoundingClientRect(), c = i / o.width, l = a / o.height;
	return `${n + (s.x - o.x) * c} ${r + (s.y - o.y) * l} ${s.width * c} ${s.height * l}`;
}
function pe(e, t, n) {
	let r = [...e.spViewboxStack, e.spOriginalViewbox], i = r[t + 1], a = r[t], o = e.querySelector("& > animate.spViewbox");
	if (o && o.getAttribute("to") !== a) {
		if (e.setAttribute("viewBox", i), o.endElement(), n) {
			o.setAttribute("from", a), o.setAttribute("to", a), o.setAttribute("dur", "0"), o.beginElement();
			return;
		}
		o.setAttribute("from", i), o.setAttribute("to", a), o.setAttribute("dur", "300ms"), o.beginElement();
	}
}
function me(e, t) {
	let n = [], r = t.querySelector(e);
	if (r) for (let t = 0; t < r.children.length; t++) n.push({
		type: "show",
		selector: `${e} > :nth-child(${t + 1})`
	});
	return n;
}
z._animCommands = {
	children: {
		countSteps(e, t) {
			if (!t) return 1;
			let n = t.querySelector(e);
			return n ? Math.max(1, n.children.length) : 1;
		},
		parse() {
			return [];
		},
		expand(e, t) {
			return me(e, t).map((e) => [e]);
		},
		init(e, t) {
			let n = t.querySelector(e);
			if (n) for (let e of n.children) e.classList.add("sp-anim-hidden"), e.classList.remove("sp-anim-shown");
		}
	},
	child: {
		countSteps: () => 1,
		parse(e) {
			let t = V(e), n = t[0] ?? "";
			if (!n) return [];
			if (t.length >= 3) {
				let e = parseInt(t[1]), r = parseInt(t[2]);
				return isNaN(e) || isNaN(r) ? [] : [{
					type: "show",
					selector: `${n} > :nth-child(n+${e}):nth-child(-n+${r})`
				}];
			}
			let r = parseInt(t[1] ?? "");
			return isNaN(r) ? [] : [{
				type: "show",
				selector: `${n} > :nth-child(${r})`
			}];
		}
	},
	add: {
		countSteps: () => 1,
		parse(e) {
			let t = V(e);
			return [{
				type: "addClass",
				className: t[0] ?? "",
				selector: t.slice(1).join(",")
			}];
		}
	},
	remove: {
		countSteps: () => 1,
		parse(e) {
			let t = V(e);
			return [{
				type: "removeClass",
				className: t[0] ?? "",
				selector: t.slice(1).join(",")
			}];
		}
	},
	"+class": {
		countSteps: () => 1,
		parse(e) {
			let t = e.trim().split(/\s+/);
			return [{
				type: "addClass",
				className: t[0] ?? "",
				selector: t.slice(1).join(" ")
			}];
		}
	},
	"-class": {
		countSteps: () => 1,
		parse(e) {
			let t = e.trim().split(/\s+/);
			return [{
				type: "removeClass",
				className: t[0] ?? "",
				selector: t.slice(1).join(" ")
			}];
		}
	},
	play: {
		countSteps: () => 1,
		parse(e) {
			let t = V(e);
			return [{
				type: "play",
				selector: t[0] || "video",
				rewind: t.slice(1).includes("rewind")
			}];
		}
	},
	pause: {
		countSteps: () => 1,
		parse(e) {
			return [{
				type: "pause",
				selector: V(e)[0] || "video"
			}];
		}
	},
	viewbox: {
		countSteps: () => 1,
		parse(e) {
			return [{
				type: "viewbox",
				selector: e.trim()
			}];
		}
	}
}, z._animActionTypes = { ...H };
function he(e) {
	return z._animCommands[e];
}
function ge(e, t) {
	z._animCommands[e] = t;
}
function _e() {
	return Object.keys(z._animCommands);
}
function ve(e, t) {
	z._animActionTypes[e] = t;
}
function ye() {
	return Object.keys(z._animActionTypes);
}
//#endregion
//#region src/plugin.ts
function be(e) {
	let t = document.createElement("style");
	t.textContent = e, document.head.appendChild(t);
}
var U = {
	_plugins: [],
	_keymapSetups: [],
	_animCommands: [],
	_animActionTypes: [],
	_domTransforms: [],
	_slideRefinements: [],
	_teardowns: /* @__PURE__ */ new Map(),
	refineAllSlides(e = document) {
		for (let t of e.querySelectorAll(".sp-slide")) for (let e of this._slideRefinements) e.appliesTo(t) && e.apply(t);
	},
	async register(e) {
		this._plugins.push(e);
		let t = () => {}, n = e.disable ?? [], r = {
			spApi: z,
			addKeymapSetup: n.includes("keymap") ? t : (e) => this._keymapSetups.push(e),
			addAnimCommand: n.includes("anim") ? t : (e, t) => this._animCommands.push({
				name: e,
				handler: t
			}),
			addAnimActionType: n.includes("anim") ? t : (e, t) => this._animActionTypes.push({
				type: e,
				handler: t
			}),
			injectStyle: n.includes("style") ? t : be,
			addChunklet: n.includes("chunklet") ? t : (e) => z.chunkletDefs.push(e),
			addDomTransform: n.includes("domTransform") ? t : (e) => this._domTransforms.push(e),
			addSlideRefinement: n.includes("slideRefinement") ? t : (e) => this._slideRefinements.push(e)
		}, i = e.activate(r), a = i instanceof Promise ? await i : i;
		if (a) {
			let t = this._teardowns.get(e.name) ?? [];
			t.push(a), this._teardowns.set(e.name, t);
		}
	},
	applyAnimRegistrations() {
		for (let { name: e, handler: t } of this._animCommands) ge(e, t);
		for (let { type: e, handler: t } of this._animActionTypes) ve(e, t);
	},
	unregister(e) {
		let t = this._plugins.findIndex((t) => t.name === e);
		t < 0 || ((this._teardowns.get(e) ?? []).forEach((e) => e()), this._teardowns.delete(e), this._plugins.splice(t, 1));
	}
};
function xe(e) {
	return e;
}
var W = T([]);
function Se(e) {
	W.value.length >= 10 && W.value.shift(), W.value.push(e);
}
function Ce() {
	W.value = [];
}
//#endregion
//#region src/composables/useSteps.ts
function we(e, t) {
	if (!e.trim()) return 0;
	let n = e.split("|").map((e) => e.trim()), r = 0;
	for (let e of n) {
		let n = e.match(/^@(\w+)\((.+)\)$/);
		if (n) {
			let e = he(n[1]);
			e ? r += e.countSteps(n[2], t) : r += 1;
		} else r += 1;
	}
	return r;
}
function G(e) {
	return !e || e === "+1" ? {
		relative: !0,
		value: 1
	} : (e = e.trim(), e.startsWith("+") || e.startsWith("-") ? {
		relative: !0,
		value: parseInt(e, 10)
	} : {
		relative: !1,
		value: parseInt(e, 10)
	});
}
var Te = /* @__PURE__ */ RegExp("<(sp-anim|sp-jump|sp-pause|sp-meanwhile|sp-toc|sp-include|sp-svg|sp-slide-source)(\\s[^>]*)?/>", "gi"), K = /* @__PURE__ */ RegExp("<(sp-drag|sp-slide)(\\s[^>]*)?(/?)>", "gi");
function Ee(e) {
	return e.replace(Te, "<$1$2></$1>");
}
function De(e) {
	let t = 0;
	return e.replace(K, (e, n, r, i) => {
		let a = `<${n} :editable-index="${t}"${i || ""}${r || ""}>`;
		return (r ?? "").includes(":editable-index=") ? e : (t++, a);
	});
}
function Oe(e) {
	return e.replace(/(\p{Emoji_Presentation})/gu, (e) => `<span style="display: inline-flex; vertical-align: middle; line-height: 0;"><svg viewBox="0 0 100 100" style="width:1em; height:1em; display: inline-block;"><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central">${e}</text></svg></span>`);
}
function ke(e) {
	e.querySelectorAll("sp-pause").forEach((e) => {
		let t = document.createElement("sp-jump");
		t.setAttribute("at", "+1"), e.replaceWith(t);
	}), e.querySelectorAll("sp-meanwhile").forEach((e) => {
		let t = document.createElement("sp-jump");
		t.setAttribute("at", "0"), e.replaceWith(t);
	});
}
function Ae(e) {
	let t = 0, n = (e) => {
		let r = Array.from(e.children);
		for (let e of r) e.tagName.toLowerCase() === "sp-step" && (e.getAttribute("also") === null ? t = parseInt(e.getAttribute("from") || "0", 10) : (e.setAttribute("from", String(t)), e.removeAttribute("also"))), n(e);
	};
	n(e);
}
function je(e) {
	e.querySelectorAll("sp-step").forEach((e) => {
		let t = e.getAttribute("from"), n = e.getAttribute("to"), r = e.getAttribute("until"), i = e.getAttribute("only"), a = e.getAttribute("hide"), o = e.getAttribute("animation");
		function s(e) {
			if (t !== null && e.setAttribute("data-sp-step-from", t), n !== null && e.setAttribute("data-sp-step-to", n), r !== null) {
				let t = parseInt(r, 10);
				isNaN(t) || e.setAttribute("data-sp-step-to", String(t - 1));
			}
			i !== null && (e.setAttribute("data-sp-step-from", i), e.setAttribute("data-sp-step-to", i)), a !== null && e.setAttribute("data-sp-step-hide", ""), o && e.setAttribute("data-sp-step-animation", o);
		}
		let c = Array.from(e.children);
		if (c.length > 0) c.forEach(s), e.replaceWith(...Array.from(e.childNodes));
		else {
			let t = document.createElement("span");
			s(t), t.innerHTML = e.innerHTML, e.replaceWith(t);
		}
	});
}
function q(e) {
	let t = 0, n = 0;
	e.querySelectorAll("[data-sp-step]").forEach((e) => {
		let t = parseInt(e.getAttribute("data-sp-step") || "0", 10);
		t > n && (n = t);
	}), e.querySelectorAll("[data-sp-step-from]").forEach((e) => {
		let t = parseInt(e.getAttribute("data-sp-step-from") || "0", 10);
		t > n && (n = t);
	}), e.querySelectorAll("[data-sp-step-to]").forEach((e) => {
		let t = parseInt(e.getAttribute("data-sp-step-to") || "0", 10);
		t > n && (n = t);
	});
	function r(e) {
		e > n && (n = e);
	}
	function i(n) {
		let a = Array.from(n.children), o = [];
		for (let n of a) {
			let a = n.tagName.toLowerCase(), s = !1, c = !1;
			if (a !== "sp-style") {
				if (a === "sp-jump") {
					let { relative: e, value: i } = G(n.getAttribute("at"));
					e ? t += i : t = i, o.push(n), r(t);
					continue;
				}
				if (a === "sp-anim") {
					let i = [null, "false"].includes(n.getAttribute("no-jump")), a = n.getAttribute("at") ?? "+0", o = t, { relative: s, value: c } = G(a);
					s ? o += c : o = c - 1, n.setAttribute("at", String(o));
					try {
						o += we(n.getAttribute("spec") || "", e);
					} catch (e) {
						console.error("(Caught) Error counting anim spec parts:", e), Se(`Error counting anim spec parts for <sp-anim> at step ${t}: ${e}`);
					}
					i ? (t = o, r(t)) : r(o);
				}
				if (a === "sp-alternatives") {
					let { relative: e, value: i } = G(n.getAttribute("at") ?? "+0");
					e ? t += i : t = i, t += n.childElementCount, r(t - 1), s = !0, c = !0;
				}
				if (a === "sp-steps" || !s && n.hasAttribute("sp-steps")) {
					let e = n.getAttribute("at") ?? "+1", i = [null, "false"].includes(n.getAttribute("no-jump")), o = parseInt(n.getAttribute("every") || "1", 10), l = n.getAttribute("animation") || "", u = t, d = G(e);
					d.relative ? u += d.value : u = d.value;
					let f = Array.from(n.children), p = Math.ceil(f.length / o);
					f.forEach((e, t) => {
						e.setAttribute("data-sp-step", String(u + Math.floor(t / o))), l && e.setAttribute("data-sp-step-animation", l);
					});
					let m = u + p - 1;
					if (i ? (t = m, r(t)) : r(m), a === "sp-steps") {
						let e = document.createElement("div");
						e.classList.add("sp-steps-no-tag");
						for (let t of Array.from(n.attributes)) [
							"at",
							"every",
							"animation",
							"no-jump"
						].includes(t.name) || e.setAttribute(t.name, t.value);
						for (; n.firstChild;) e.appendChild(n.firstChild);
						n.replaceWith(e);
					} else n.removeAttribute("sp-steps"), n.removeAttribute("at"), n.removeAttribute("every"), n.removeAttribute("animation"), n.removeAttribute("no-jump");
					s = !0, c = !0;
					continue;
				}
				!s && t > 0 && !n.hasAttribute("data-sp-step") && n.setAttribute("data-sp-step", String(t)), c || i(n);
			}
		}
		for (let e of o) e.remove();
	}
	return i(e), n + 1;
}
function Me(e) {
	for (let t of U._domTransforms) t(e);
}
function Ne(e) {
	let t = document.createElement("div");
	t.innerHTML = e, ke(t), Ae(t), je(t);
	let n = q(t);
	return Me(t), {
		html: t.innerHTML,
		steps: n
	};
}
function Pe() {
	let e = T(0), t = T(1), r = n(() => e.value === 0), i = n(() => t.value <= 1 || e.value >= t.value - 1);
	function a() {
		e.value < t.value - 1 && e.value++;
	}
	function o() {
		e.value > 0 && e.value--;
	}
	return {
		stepIndex: e,
		totalSteps: t,
		isFirstStep: r,
		isLastStep: i,
		nextStep: a,
		prevStep: o,
		processSlideHtml: Ne
	};
}
function Fe(e) {
	return e == null ? null : Ne(e.html);
}
//#endregion
//#region src/composables/includeCache.ts
var Ie = /* @__PURE__ */ new Map(), Le = /* @__PURE__ */ new Map(), Re = /* @__PURE__ */ new Map(), ze = /* @__PURE__ */ new Map(), Be = [];
function Ve(e) {
	Be = e.map((e) => new RegExp(e));
}
function He(e) {
	return Be.some((t) => t.test(e));
}
var J = /* @__PURE__ */ new Map();
function Ue(e, t) {
	J.set(e, {
		size: t ? t.length : 0,
		timestamp: Date.now()
	});
}
function We(e) {
	let t = Ie.get(e);
	return t || (t = T(void 0), Ie.set(e, t)), t;
}
function Ge(e) {
	let t = Le.get(e);
	return t || (t = T(void 0), Le.set(e, t)), t;
}
function Ke(e) {
	if (He(e)) return Promise.resolve();
	let t = We(e);
	if (t.value !== void 0) return Promise.resolve();
	if (Re.has(e)) return Re.get(e);
	let n = fetch(e).then((e) => {
		if (!e.ok) throw Error(`HTTP ${e.status}`);
		return e.text();
	}).then((n) => {
		t.value = n, Ue(e, n), Re.delete(e);
	}).catch(() => {
		t.value = "", Ue(e), Re.delete(e);
	});
	return Re.set(e, n), n;
}
function qe(e) {
	if (He(e)) return Promise.resolve();
	let t = Ge(e);
	if (t.value !== void 0) return Promise.resolve();
	if (ze.has(e)) return ze.get(e);
	let n = fetch(e).then((e) => {
		if (!e.ok) throw Error(`HTTP ${e.status}`);
		return e.blob();
	}).then((e) => new Promise((t, n) => {
		let r = new FileReader();
		r.onload = () => t(r.result), r.onerror = n, r.readAsDataURL(e);
	})).then((n) => {
		t.value = n, Ue(e, n), ze.delete(e);
	}).catch(() => {
		t.value = "", Ue(e), ze.delete(e);
	});
	return ze.set(e, n), n;
}
function Je() {
	let e = {};
	for (let [t, n] of Ie) n.value !== void 0 && (e[t] = n.value);
	let t = {};
	for (let [e, n] of Le) n.value !== void 0 && (t[e] = n.value);
	return JSON.stringify({
		text: e,
		binary: t
	});
}
function Ye(e) {
	let t = JSON.parse(e), n = Date.now();
	if (t.text) for (let [e, r] of Object.entries(t.text)) We(e).value = r, J.set(e, {
		size: r.length,
		timestamp: n
	});
	else for (let [e, r] of Object.entries(t)) We(e).value = r, J.set(e, {
		size: r.length,
		timestamp: n
	});
	if (t.binary) for (let [e, r] of Object.entries(t.binary)) Ge(e).value = r, J.set(e, {
		size: r.length,
		timestamp: n
	});
}
function Xe() {
	let e = [];
	for (let [t] of Ie) {
		let n = J.get(t);
		e.push({
			path: t,
			size: n?.size ?? 0,
			timestamp: n?.timestamp ?? 0,
			type: "text"
		});
	}
	for (let [t] of Le) {
		let n = J.get(t);
		e.push({
			path: t,
			size: n?.size ?? 0,
			timestamp: n?.timestamp ?? 0,
			type: "binary"
		});
	}
	return e.sort((e, t) => t.timestamp - e.timestamp);
}
function Ze() {
	for (let e of Ie.values()) e.value = void 0;
	for (let [e] of Ie) J.delete(e);
	Re.clear();
}
function Qe(e) {
	let t = window.location.href, n = new URL(e, t).href;
	for (let [e, r] of Ie) try {
		if (new URL(e, t).href === n) {
			r.value = void 0, J.delete(e), Re.delete(e);
			return;
		}
	} catch {}
}
function $e() {
	for (let e of Ie.values()) e.value = void 0;
	for (let e of Le.values()) e.value = void 0;
	Ie.clear(), Le.clear(), J.clear(), Re.clear(), ze.clear();
}
function et(e) {
	let t = Ie.get(e);
	t && (t.value = void 0);
	let n = Le.get(e);
	n && (n.value = void 0), J.delete(e);
}
//#endregion
//#region src/composables/resolveIncludes.ts
async function tt(e) {
	let t = We(e);
	if (t.value !== void 0) return t.value;
	try {
		let n = await fetch(e);
		if (!n.ok) return "";
		let r = await n.text();
		return t.value = r, r;
	} catch {
		return "";
	}
}
function nt(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
async function Y(e, t = /* @__PURE__ */ new Set(), n = window.location.pathname) {
	let r = /<sp-include\s[^>]*?src="([^"]*)"[^>]*?(\/>|><\/sp-include>)/g, i = `<span style="display:none" data-source-file-push="${n}"></span>`;
	e = e.replace(/<sp-slide[^>]*>/g, (e) => e + i).replace(/<\/sp-slide>/g, (e) => "<span style=\"display:none\" data-source-file-pop></span>" + e);
	let a = [], o;
	for (; (o = r.exec(e)) !== null;) a.push({
		src: o[1],
		index: o.index
	});
	if (a.length === 0) return e;
	let s = a.filter(({ index: t }) => {
		let n = e.slice(0, t);
		return (n.match(/<sp-slide[\s>]/g) || []).length === (n.match(/<\/sp-slide>/g) || []).length;
	}).filter(({ src: e }) => !t.has(e));
	if (s.length === 0) return e;
	let c = await Promise.all(s.map(async ({ src: e }) => {
		t.add(e);
		try {
			let n = await tt(e);
			return n = Ee(n), n = De(n), {
				src: e,
				content: await Y(n, t, e)
			};
		} catch {
			return {
				src: e,
				content: ""
			};
		}
	})), l = e;
	for (let { src: e, content: t } of c) {
		if (!t) continue;
		let n = RegExp(`<sp-include[^>]*?src="${nt(e)}"[^>]*?(\\/?>|><\\/sp-include>)`, "g");
		l = l.replace(n, t);
	}
	return l;
}
function rt(e) {
	if (!e) return null;
	let t = [];
	function n(e) {
		function r(e) {
			let n = e.getAttribute("data-source-file-push");
			n && t.push(n), e.hasAttribute("data-source-file-pop") && t.pop();
		}
		r(e);
		let i = "[data-source-file-push],[data-source-file-pop]";
		if (e.parentElement === null) return;
		n(e.parentElement);
		let a = e.parentElement?.children[0];
		for (; a !== e && a !== null;) a.matches(i) && r(a), a.querySelectorAll(i).forEach(r), a = a?.nextElementSibling;
	}
	if (n(e), t.length === 0) return null;
	let r = t[0];
	for (let e = 1; e < t.length; e++) {
		let n = t[e];
		if (n.startsWith("/")) r = n;
		else {
			let e = r.lastIndexOf("/");
			r = r.slice(0, e + 1) + n;
		}
	}
	return r;
}
//#endregion
//#region node_modules/.pnpm/tinykeys@4.0.0/node_modules/tinykeys/dist/tinykeys.mjs
var it = [
	"Shift",
	"Meta",
	"Alt",
	"Control"
], at = 1e3, ot = "keydown", X = typeof navigator == "object" ? navigator.platform : "", st = /Mac|iPod|iPhone|iPad/.test(X) ? "Meta" : "Control", ct = X === "Win32" ? ["Control", "Alt"] : ["Alt"];
function lt(e) {
	return !!(e.key && e.code && e.getModifierState);
}
function ut(e) {
	let t = e.target;
	return e.repeat || e.isComposing || t !== e.currentTarget && t.matches("[contenteditable],input,select,textarea");
}
function dt(e, t) {
	return typeof e.getModifierState == "function" ? e.getModifierState(t) || ct.includes(t) && e.getModifierState("AltGraph") : !1;
}
function ft(e) {
	return e.trim().split(" ").map((e) => {
		let t = e.split(/(?<=\w|\])\+/), n = t.pop(), r = n.match(/^\((.+)\)$/), i = r ? RegExp(`^(?:${r[1]})$`, "iv") : n, a = [], o = [];
		for (let e of t) {
			let t = e.match(/^\[(.*)\]$/), n = t?.[1] ?? e;
			n = n === "$mod" ? st : n, t ? o.push(n) : a.push(n);
		}
		return [
			a,
			o,
			i
		];
	});
}
function pt(e, [t, n, r]) {
	let i = t.includes("AltGraph");
	return !((r instanceof RegExp ? !(r.test(e.key) || r.test(e.code)) : r.toUpperCase() !== e.key.toUpperCase() && r !== e.code) || t.find((t) => !dt(e, t)) || it.find((a) => !t.includes(a) && !n.includes(a) && r !== a && dt(e, a) && !(i && ct.includes(a))));
}
function mt(e, t = {}) {
	let n = t.timeout ?? at, r = t.ignore ?? ut, i = Object.keys(e).map((t) => [
		t,
		ft(t),
		e[t]
	]), a = /* @__PURE__ */ new Map(), o = null;
	return (e) => {
		if (!lt(e) || r(e)) return;
		let t = [];
		for (let [n, r, o] of i) {
			let [i, ...s] = a.get(n) || r;
			if (!pt(e, i)) dt(e, e.key) || a.delete(n);
			else if (s.length > 0) a.set(n, s), t.push(n);
			else if (a.delete(n), t.length) console.warn(`tinykeys: Conflict found, "${n}" did not fire, waiting for:`, t);
			else {
				o(e);
				break;
			}
		}
		o && clearTimeout(o), o = setTimeout(() => a.clear(), n);
	};
}
function ht(e, t, n = {}) {
	let r = n.event ?? ot, i = mt(t, n);
	return e.addEventListener(r, i, n.capture), () => {
		e.removeEventListener(r, i, n.capture);
	};
}
//#endregion
//#region src/keymap/manager.ts
var gt = class {
	constructor(e) {
		this._setups = [], this._unsubscribe = null, this._getContext = e;
	}
	addSetup(e) {
		this._setups.push(e);
	}
	removeSetup(e) {
		let t = this._setups.indexOf(e);
		t >= 0 && this._setups.splice(t, 1);
	}
	_resolve() {
		let e = {};
		for (let t of this._setups) t(e);
		return e;
	}
	_wrapHandlers(e) {
		let t = {};
		for (let [n, r] of Object.entries(e)) {
			let e = r.__bind, i = e?.when, a = e?.preventDefault !== !1;
			t[n] = (e) => {
				i && !i(this._getContext()) || (a && e.preventDefault(), r(e));
			};
		}
		return t;
	}
	rebuild() {
		this._unsubscribe?.();
		let e = this._resolve(), t = this._wrapHandlers(e);
		this._unsubscribe = ht(window, t, { ignore: (e) => ut(e) || this._getContext().dragging });
	}
	mount() {
		this.rebuild();
	}
	unmount() {
		this._unsubscribe?.(), this._unsubscribe = null;
	}
};
//#endregion
//#region src/keymap/useKeymap.ts
function _t(e) {
	let t = new gt(e.getContext);
	for (let n of e.setupFns ?? []) t.addSetup(n);
	function n(e) {
		t.addSetup(e), t.rebuild();
	}
	function r(e) {
		t.removeSetup(e), t.rebuild();
	}
	return y(() => t.mount()), b(() => t.unmount()), {
		addSetup: n,
		removeSetup: r,
		rebuild: () => t.rebuild()
	};
}
//#endregion
//#region src/keymap/bind.ts
function vt(e, t) {
	let n = (t) => e(t);
	return t && (n.__bind = t), n;
}
//#endregion
//#region src/keymap/defaults.ts
function yt(e) {
	return (t) => {
		t.ArrowRight = t.Space = () => e.next(), t.ArrowLeft = () => e.prev(), t.ArrowUp = () => e.goToPrevBegin(), t.ArrowDown = () => e.goToNextBegin(), t.a = () => e.goToPrevEnd(), t.z = () => e.goToNextEnd(), t.Home = () => e.goTo(0), t.End = () => e.goTo(e.total.value - 1), t.f = vt(() => {
			document.fullscreenElement ? document.exitFullscreen().catch(() => {}) : document.documentElement.requestFullscreen().catch(() => {});
		}, { preventDefault: !1 }), t.Escape = vt(() => {
			document.fullscreenElement && document.exitFullscreen().catch(() => {}), e.onOverviewExit?.(), e.onBlackoutExit?.();
		}, { preventDefault: !1 }), t.p = () => e.onPresenterToggle?.(), t.o = () => e.onOverviewToggle?.(), t.g = () => e.onGoPrompt?.(), t.b = () => e.onBlackoutToggle?.(), t.d = () => e.onDevPaneToggle?.(), t.c = () => e.onChunkBarToggle?.();
	};
}
//#endregion
//#region src/composables/useNavigation.ts
function bt(e, t) {
	let n = [yt(e), ...t?.extraSetups ?? []], { rebuild: r } = _t({
		getContext: t?.getContext ?? (() => ({
			overview: !1,
			presenter: !1,
			blackout: !1,
			devPane: !1,
			dragging: z.dragging,
			goPrompt: !1
		})),
		setupFns: n
	}), i = 0, a = 0;
	function o(e) {
		i = e.touches[0].clientX, a = e.touches[0].clientY;
	}
	function s(t) {
		if (z.dragging) return;
		let n = t.changedTouches[0].clientX - i, r = t.changedTouches[0].clientY - a;
		Math.abs(n) < 30 && Math.abs(r) < 30 || Math.abs(n) < Math.abs(r) || (n < 0 ? e.isLastStep.value ? e.currentIndex.value < e.total.value - 1 && e.next() : e.nextStep() : e.isFirstStep.value ? e.currentIndex.value > 0 && e.prev() : e.prevStep());
	}
	return y(() => {
		window.addEventListener("touchstart", o, { passive: !0 }), window.addEventListener("touchend", s, { passive: !0 });
	}), b(() => {
		window.removeEventListener("touchstart", o), window.removeEventListener("touchend", s);
	}), { rebuildKeymap: r };
}
//#endregion
//#region src/composables/usePresenter.ts
function xt() {
	let e = T(null), t = null;
	try {
		t = new BroadcastChannel("sp-presenter");
	} catch {}
	let r = /* @__PURE__ */ new Map();
	t && t.addEventListener("message", (e) => {
		let t = e.data ?? {}, n = r.get(t.type);
		n && n.forEach((e) => e(t));
	});
	let i = n(() => e.value !== null && !e.value.closed);
	function a() {
		let t = new URL(window.location.href);
		t.searchParams.set("presenter", "1");
		let n = window.open(t.toString(), "sp-presenter", "width=1280,height=720");
		n && (e.value = n);
	}
	function o() {
		e.value && !e.value.closed && e.value.close(), e.value = null;
	}
	function s(e, n) {
		t?.postMessage(n === void 0 ? { type: e } : {
			type: e,
			...n
		});
	}
	function c(e, t) {
		return r.has(e) || r.set(e, /* @__PURE__ */ new Set()), r.get(e).add(t), () => r.get(e)?.delete(t);
	}
	function l(e, t) {
		s("sync", {
			slide: e,
			step: t
		});
	}
	function u(e) {
		s("blackout", { active: e });
	}
	return b(() => {
		t?.close();
	}), {
		presenterWindow: e,
		presenterActive: i,
		openPresenterWindow: a,
		closePresenter: o,
		send: s,
		onMessage: c,
		syncState: l,
		syncBlackout: u,
		channel: t
	};
}
//#endregion
//#region src/composables/useScale.ts
function St(e = 1920, t = 1080) {
	let r = T(window.innerWidth), i = T(window.innerHeight);
	function a() {
		r.value = window.innerWidth, i.value = window.innerHeight;
	}
	let o = n(() => {
		let n = Math.min(r.value / e, i.value / t);
		return Math.min(n, 10);
	}), s = n(() => {
		let n = o.value;
		return {
			transform: `scale(${n}) translate(${(r.value - e * n) / (2 * n)}px, ${(i.value - t * n) / (2 * n)}px)`,
			transformOrigin: "top left",
			width: e + "px",
			height: t + "px",
			"--slide-transform-scale": `${o.value}`
		};
	}), c = n(() => ({
		width: r.value + "px",
		height: i.value + "px"
	}));
	return y(() => {
		a(), window.addEventListener("resize", a);
	}), b(() => {
		window.removeEventListener("resize", a);
	}), {
		transformStyle: s,
		containerStyle: c
	};
}
//#endregion
//#region src/composables/useStorage.ts
var Ct = "sp-config", wt = {
	navLocked: !1,
	overviewScale: .15,
	proMode: !1,
	logSteps: !1,
	darkMode: "light"
};
function Tt() {
	try {
		let e = localStorage.getItem(Ct);
		return e ? {
			...wt,
			...JSON.parse(e)
		} : { ...wt };
	} catch {
		return { ...wt };
	}
}
var Et = w(Tt());
N(Et, () => {
	try {
		localStorage.setItem(Ct, JSON.stringify(Et));
	} catch {}
}, { deep: !0 });
function Dt() {
	return Et;
}
function Ot() {
	for (let e of Object.keys(Et)) e in wt ? Et[e] = wt[e] : delete Et[e];
}
//#endregion
//#region src/composables/useSlideRefinement.ts
function kt(e) {
	function t() {
		let t = e.root();
		t && U.refineAllSlides(t);
	}
	let n = () => h(t);
	return N([
		e.currentIndex,
		e.stepIndex,
		e.contentVersion
	], n, { flush: "post" }), n(), {
		run: t,
		schedule: n
	};
}
//#endregion
//#region src/composables/useChunklets.ts
function At(e) {
	let t = [], n = /<sp-chunk\b([^>]*)>([\s\S]*?)<\/sp-chunk>/gi, r;
	for (; (r = n.exec(e)) !== null;) {
		let e = r[1], n = /name="([^"]*)"/.exec(e)?.[1];
		if (!n) continue;
		let i = (/params="([^"]*)"/.exec(e)?.[1] || "").split(",").map((e) => e.trim()).filter(Boolean), a = r[2].replace(/^\s*\n/m, "").replace(/\n\s*$/m, "");
		if (!a) continue;
		let o = /data-kind="([^"]*)"/.exec(e)?.[1] === "typst" ? "typst" : "html";
		t.push({
			name: n,
			params: i,
			html: a,
			kind: o
		});
	}
	return t;
}
function jt(e) {
	let t = [];
	return e.querySelectorAll("sp-chunk").forEach((e) => {
		let n = e.getAttribute("name");
		if (!n) return;
		let r = (e.getAttribute("params") || "").split(",").map((e) => e.trim()).filter(Boolean), i = e.innerHTML.replace(/^\s*\n/m, "").replace(/\n\s*$/m, "");
		if (!i) return;
		let a = e.getAttribute("data-kind") === "typst" ? "typst" : "html";
		t.push({
			name: n,
			params: r,
			html: i,
			kind: a
		});
	}), t;
}
function Mt(e, t) {
	return e.replace(/\$(\w+)/g, (e, n) => n in t ? String(t[n]) : `$${n}`);
}
function Nt(e) {
	if (e.params.length === 0) return "instant";
	let t = e.params.includes("w"), n = e.params.includes("h");
	return t || n ? "drag" : "click";
}
function Pt() {
	let e = document.querySelector(".sp-scale-wrap");
	if (!e) return 1;
	let t = window.getComputedStyle(e).transform;
	if (!t || t === "none") return 1;
	let n = t.match(/matrix\(([^)]+)\)/);
	if (n) return parseFloat(n[1].split(", ")[0]) || 1;
	let r = t.match(/matrix3d\(([^)]+)\)/);
	return r && parseFloat(r[1].split(", ")[0]) || 1;
}
//#endregion
//#region src/composables/dragEditing.ts
var Z = T("idle"), Ft = "sp-drag-saved-flash", Q = null, It = null;
function Lt() {
	Q && clearTimeout(Q), It && clearTimeout(It), Z.value = "saving", It = setTimeout(() => Rt(), 4e3);
}
function Rt(e = !1) {
	It && clearTimeout(It), Z.value = "saved";
	let t = (() => {
		if (!e) return !1;
		try {
			return sessionStorage.setItem(Ft, "1"), !0;
		} catch {
			return !1;
		}
	})();
	Q && clearTimeout(Q), Q = setTimeout(() => {
		if (Z.value = "idle", t) try {
			sessionStorage.removeItem(Ft);
		} catch {}
	}, 2200);
}
function zt() {
	It && clearTimeout(It), Q && clearTimeout(Q), Z.value = "error", Q && clearTimeout(Q), Q = setTimeout(() => {
		Z.value = "idle";
	}, 4e3);
}
function Bt() {
	try {
		let e = sessionStorage.getItem(Ft);
		return sessionStorage.removeItem(Ft), e === "1" ? (Z.value = "saved", Q && clearTimeout(Q), Q = setTimeout(() => {
			Z.value = "idle";
		}, 2200), !0) : !1;
	} catch {
		return !1;
	}
}
var Vt = /* @__PURE__ */ new Map(), $ = null, Ht = !1, Ut = !1, Wt = "sp-drag-edit-target";
function Gt(e) {
	try {
		sessionStorage.setItem(Wt, JSON.stringify({
			index: e.index,
			slide: e.slide
		}));
	} catch {}
}
function Kt() {
	try {
		sessionStorage.removeItem(Wt);
	} catch {}
}
var qt = 0;
function Jt() {
	qt++;
}
function Yt() {
	setTimeout(() => {
		qt = Math.max(0, qt - 1);
	}, 0);
}
function Xt(e) {
	return e.el.isConnected && !!e.el.closest(".sp-slide-current") && !e.el.closest(".sp-overview");
}
function Zt(e) {
	let t = parseInt(window.getComputedStyle(e.el).zIndex, 10);
	return isNaN(t) ? 0 : t;
}
function Qt(e, t) {
	let n = [];
	for (let r of Vt.values()) Xt(r) && $t(r.el, e, t) && n.push(r);
	return n.sort((e, t) => {
		let n = Zt(e), r = Zt(t);
		return n === r ? e.el.compareDocumentPosition(t.el) & Node.DOCUMENT_POSITION_PRECEDING ? -1 : 1 : r - n;
	});
}
function $t(e, t, n) {
	let r = e.getBoundingClientRect();
	if (t < r.left || t > r.right || n < r.top || n > r.bottom) return !1;
	let i = 0, a = window.getComputedStyle(e).transform;
	if (a && a !== "none") {
		let e = a.match(/matrix\(([^)]+)\)/) || a.match(/matrix3d\(([^)]+)\)/);
		if (e) {
			let t = e[1].split(",").map((e) => parseFloat(e.trim()));
			i = Math.atan2(t[1], t[0]);
		}
	}
	let o = Pt(), s = t - (r.left + r.width / 2), c = n - (r.top + r.height / 2), l = Math.cos(i), u = Math.sin(i), d = s * l + c * u, f = -s * u + c * l, p = .5;
	return Math.abs(d) <= o * e.offsetWidth / 2 + p && Math.abs(f) <= o * e.offsetHeight / 2 + p;
}
var en = [], tn = !1;
function nn() {
	tn = !0;
}
function rn(e) {
	let t = Qt(e.clientX, e.clientY);
	if (t.length === 0) {
		en = [], tn = !1;
		return;
	}
	let n = $ && Xt($) ? $ : null;
	if (!tn && n && t.includes(n)) {
		let e = en.indexOf(n);
		if (e !== -1) {
			tn = !1, un(en[(e + 1) % en.length]);
			return;
		}
	}
	tn = !1, en = t.slice(), un(t[0]);
}
function an(e) {
	if (!$ || qt > 0) return;
	let t = e.target;
	if (t instanceof Element && !t.closest(".sp-edit-quit-btn") && !$.el.contains(t)) {
		for (let e of Vt.values()) if (e.el.contains(t)) return;
		Kt(), $.saveAndEnd();
	}
}
function on(e) {
	Vt.set(e.el, e), Ht ||= (document.addEventListener("dblclick", rn, !0), !0), Ut ||= (document.addEventListener("click", an), !0);
}
function sn(e) {
	Vt.delete(e), $ && $.el === e && ($ = null, z.dragging = !1, cn());
}
function cn() {
	document.body.classList.toggle("sp-editing-drag", z.dragging);
}
function ln() {
	return $ !== null;
}
function un(e) {
	if (!Xt(e)) return;
	let t = $;
	t !== e && ($ = e, z.dragging = !0, Gt(e), cn(), t && t.saveAndEnd(), e.begin());
}
function dn(e) {
	$ === e && ($ = null, z.dragging = !1, cn());
}
function fn() {
	$ && (Kt(), $.saveAndEnd());
}
function pn() {
	Kt();
}
function mn(e) {
	if ($) return !1;
	let t = null;
	try {
		let e = sessionStorage.getItem(Wt);
		if (!e) return !1;
		t = JSON.parse(e);
	} catch {
		return !1;
	}
	return !t || typeof t.index != "number" || t.index < 0 || t.index !== e.index || t.slide !== e.slide ? !1 : (un(e), !0);
}
//#endregion
//#region src/composables/optimisticEdits.ts
var hn = /* @__PURE__ */ new Map(), gn = T(""), _n = null;
function vn(e) {
	_n = e;
}
function yn(e, t) {
	hn.set(e, t), _n?.();
}
function bn(e) {
	return hn.get(e) ?? null;
}
function xn(e) {
	return e.replace(/^rbox="|"$/g, "");
}
function Sn(e) {
	let t = hn.get(e);
	if (!t) return null;
	let n = xn(t).split("|");
	return n.length < 5 ? null : {
		x: parseFloat(n[0]) || 0,
		y: parseFloat(n[1]) || 0,
		w: n[2],
		h: n[3],
		rotate: parseFloat(n[4]) || 0
	};
}
var Cn = /<(sp-drag|sp-slide)(\s[^>]*)?(\/?)>/gi;
function wn(e, t) {
	let n = 0, r;
	for (Cn.lastIndex = 0; (r = Cn.exec(e)) !== null;) {
		if (n === t) {
			if (r[1] !== "sp-drag") return null;
			let t = r.index, n = e.indexOf("</sp-drag>", t);
			return n === -1 ? null : {
				start: t,
				end: n,
				slice: e.slice(t, n)
			};
		}
		n++;
	}
	return null;
}
function Tn(e, t) {
	let n = wn(e, t);
	if (!n) return null;
	let r = n.slice.match(/(?:^|\s)rbox="([^"]*)"/);
	return r ? r[1] : "";
}
function En(e, t, n) {
	let r = wn(e, t);
	if (!r) return e;
	let i = xn(n), a;
	if (/ rbox=/.test(r.slice)) {
		let t = /(<sp-drag\s[^>]*?\brbox=)"[^"]*"/i.exec(r.slice);
		if (!t) return e;
		a = r.slice.replace(t[0], `${t[1]}"${i}"`);
	} else {
		let t = /<sp-drag\b([^>]*?)(\/?\s*>)/i, n = t.exec(r.slice);
		if (!n) return e;
		a = r.slice.replace(t, `<sp-drag${n[1]} rbox="${i}"${n[2]}`);
	}
	return a === r.slice ? e : e.slice(0, r.start) + a + e.slice(r.end);
}
function Dn(e) {
	let t = e;
	for (let [e, n] of hn) {
		let r = En(t, e, n);
		r !== t && (t = r);
	}
	return t;
}
function On(e) {
	for (let t of Array.from(hn.keys())) {
		let n = hn.get(t);
		n != null && xn(Tn(e, t) ?? "") === xn(n) && hn.delete(t);
	}
	return Dn(e);
}
function kn() {
	return ce(Dn(gn.value));
}
//#endregion
//#region src/components/SpStepManager.vue
var An = /* @__PURE__ */ f({
	__name: "SpStepManager",
	setup(e) {
		let t = T(null), n = p("stepIndex", { value: 0 }), r = p("contentVersion", { value: 0 }), i = p("animInstances", /* @__PURE__ */ new Set()), a = -1;
		function s() {
			return t.value?.closest(".sp-slide") || t.value?.parentElement;
		}
		function c() {
			let e = s();
			if (!e) return n.value;
			let t = e.querySelector("[data-fixed-step]")?.getAttribute("data-fixed-step");
			return t == null ? n.value : parseInt(t);
		}
		function l(e, t) {
			let n = e.getAttribute("data-sp-step"), r = e.getAttribute("data-sp-step-from"), i = e.getAttribute("data-sp-step-to");
			return r === null ? n === null || t >= parseInt(n, 10) : t < parseInt(r, 10) ? !1 : i === null || t <= parseInt(i, 10);
		}
		function u(e) {
			let t = s();
			t && t.querySelectorAll("[data-sp-step], [data-sp-step-from], [data-sp-step-to], [data-sp-step-hide]").forEach((t) => {
				if (t.closest("[data-sp-animated]") !== null) return;
				let n = l(t, e);
				t.classList.toggle("sp-anim-shown", n), t.classList.toggle("sp-anim-hidden", !n), t.hasAttribute("data-sp-step-hide") && t.classList.toggle("sp-anim-only", !0);
				let r = t.getAttribute("data-sp-step-animation");
				r && t.classList.toggle(`sp-anim-preset-${r}`, !0);
			});
		}
		function d(e, t, n = !1) {
			let r = s();
			if (r) {
				u(e);
				for (let r of i) r.syncToStep(e, t), n && r.refresh(t);
				if (t) for (let e of r.getAnimations({ subtree: !0 })) try {
					let t = e.effect?.getComputedTiming(), n = t && t.iterations !== Infinity, i = e.effect?.target;
					n && i instanceof Element && i === r && (n = !1), n && i instanceof Element && i.closest(".sp-anim-protect") !== null && (n = !1), n && e.finish();
				} catch {}
				a = e;
			}
		}
		return y(() => {
			h(() => d(c(), !0));
		}), N(n, (e) => {
			let t = c();
			t !== a && d(t, Math.abs(t - a) > 1 || a < 0);
		}), N(r, () => {
			a = -1, h(() => d(c(), !0, !0));
		}), (e, n) => (S(), o("span", {
			ref_key: "rootEl",
			ref: t,
			style: { display: "none" }
		}, null, 512));
	}
}), jn = /* @__PURE__ */ f({
	__name: "SpSlide",
	props: {
		slide: {},
		html: {},
		components: {},
		fixedStep: {}
	},
	setup(e) {
		let t = e, r = n(() => {
			let e = ["sp-slide"];
			return t.slide && e.push(`sp-slide-${t.slide.num}`), t.slide?.class && e.push(t.slide.class), e;
		});
		C("slideNum", n(() => t.slide?.num)), C("animInstances", /* @__PURE__ */ new Set());
		let a = k(null);
		return N(() => [t.html, t.fixedStep], ([e, n]) => {
			if (!e) {
				a.value = null;
				return;
			}
			let r = n === void 0 ? "" : ` data-fixed-step="${n}"`, i = {
				"sp-step-manager": An,
				...t.components
			};
			a.value = f({
				template: `<div${r}>${e}<sp-step-manager /></div>`,
				components: i
			});
		}, { immediate: !0 }), (e, t) => (S(), o("div", { class: g(r.value) }, [(S(), i(O(a.value)))], 2));
	}
}), Mn = { class: "sp-dev-pane" }, Nn = { class: "sp-dev-header" }, Pn = { class: "sp-dev-section" }, Fn = {
	key: 0,
	class: "sp-dev-empty"
}, In = {
	key: 1,
	class: "sp-dev-table"
}, Ln = ["title"], Rn = { class: "sp-dev-num" }, zn = { class: "sp-dev-num" }, Bn = ["onClick"], Vn = ["disabled"], Hn = { class: "sp-dev-section" }, Un = ["title"], Wn = { class: "sp-dev-section sp-dev-config" }, Gn = { class: "sp-dev-config-fields" }, Kn = { class: "sp-dev-config-label" }, qn = {
	key: 0,
	class: "sp-dev-choice-group"
}, Jn = ["onClick"], Yn = ["checked", "onChange"], Xn = [
	"min",
	"max",
	"step",
	"value",
	"onInput"
], Zn = ["value", "onInput"], Qn = /* @__PURE__ */ f({
	__name: "SpDevPane",
	props: {
		visible: { type: Boolean },
		exportFn: { type: Function }
	},
	emits: ["close"],
	setup(r, { emit: c }) {
		let u = Dt(), d = n(() => {
			let e = {};
			for (let t of Object.keys(u)) e[t] = u[t];
			return JSON.stringify(e, null, 1);
		}), f = {
			navLocked: {
				key: "navLocked",
				type: "boolean"
			},
			overviewScale: {
				key: "overviewScale",
				type: "number",
				min: .05,
				max: .5,
				step: .01
			},
			proMode: {
				key: "proMode",
				type: "boolean"
			},
			logSteps: {
				key: "logSteps",
				type: "boolean"
			},
			darkMode: {
				key: "darkMode",
				type: "choice",
				choices: [
					"light",
					"auto",
					"dark"
				]
			}
		}, m = n(() => Object.keys(u).filter((e) => e !== "proMode" || u.proMode).map((e) => f[e] ?? {
			key: e,
			type: "string"
		})), h = p("liveUpdatesCount", T(0)), _ = T(0), v = null, x = n(() => {
			let e = _.value / 9;
			return e >= 1 ? "done" : e > .66 ? "warm" : e > .33 ? "mid" : "cool";
		});
		function C() {
			if (_.value++, v && clearTimeout(v), _.value >= 9) {
				u.proMode = !0, v = setTimeout(() => {
					_.value = 0;
				}, 1200);
				return;
			}
			v = setTimeout(() => {
				_.value = 0;
			}, 2e3);
		}
		let w = r, D = T(Xe()), O = null;
		function k() {
			M(), O = setInterval(() => {
				D.value = Xe();
			}, 1e3);
		}
		function M() {
			O !== null && (clearInterval(O), O = null);
		}
		N(() => w.visible, (e) => {
			e ? (D.value = Xe(), k()) : M();
		}), y(() => {
			w.visible && k();
		}), b(M);
		function ee() {
			$e(), D.value = Xe();
		}
		function te(e) {
			et(e), D.value = Xe();
		}
		function ne() {
			w.exportFn?.();
		}
		function re() {
			Ot();
		}
		function P(e) {
			return e < 1024 ? e + " B" : e < 1024 * 1024 ? (e / 1024).toFixed(1) + " KB" : (e / (1024 * 1024)).toFixed(1) + " MB";
		}
		function ie(e) {
			if (!e) return "—";
			let t = new Date(e);
			return t.toLocaleTimeString() + " " + t.toLocaleDateString();
		}
		return (n, c) => (S(), i(t, { to: "body" }, [r.visible ? (S(), o("div", {
			key: 0,
			class: "sp-dev-overlay",
			onClick: c[1] ||= F((e) => n.$emit("close"), ["self"])
		}, [s("div", Mn, [
			s("div", Nn, [s("h2", { onClick: C }, [c[2] ||= l(" Dev Tools ", -1), _.value > 0 ? (S(), o("span", {
				key: 0,
				class: g(["sp-dev-title-clicks", x.value])
			}, A(_.value) + "/9", 3)) : a("", !0)]), s("button", {
				class: "sp-dev-close",
				onClick: c[0] ||= (e) => n.$emit("close"),
				"aria-label": "Close"
			}, "×")]),
			s("section", Pn, [
				s("h3", null, "Live Updates (" + A(j(h)) + ")", 1),
				s("h3", null, "Cache (" + A(D.value.length) + " entries)", 1),
				D.value.length === 0 ? (S(), o("div", Fn, "No cached entries")) : (S(), o("table", In, [c[3] ||= s("thead", null, [s("tr", null, [
					s("th", null, "Path"),
					s("th", null, "Size"),
					s("th", null, "Fetched"),
					s("th", null, "Type"),
					s("th")
				])], -1), s("tbody", null, [(S(!0), o(e, null, E(D.value, (e) => (S(), o("tr", { key: e.path + e.type }, [
					s("td", {
						class: "sp-dev-path",
						title: e.path
					}, A(e.path), 9, Ln),
					s("td", Rn, A(P(e.size)), 1),
					s("td", zn, A(ie(e.timestamp)), 1),
					s("td", null, A(e.type), 1),
					s("td", null, [s("button", {
						class: "sp-dev-del",
						onClick: (t) => te(e.path),
						title: "Remove entry"
					}, "×", 8, Bn)])
				]))), 128))])])),
				s("button", {
					class: "sp-dev-btn",
					onClick: ee,
					disabled: D.value.length === 0
				}, " Clear Cache ", 8, Vn)
			]),
			s("section", Hn, [
				c[4] ||= s("h3", null, "Actions", -1),
				s("button", {
					class: "sp-dev-btn",
					onClick: ne
				}, "Export Standalone"),
				s("button", {
					class: "sp-dev-btn",
					onClick: re,
					title: d.value
				}, "Clear localStorage Keys", 8, Un)
			]),
			s("details", Wn, [c[5] ||= s("summary", null, [s("h3", null, "Config")], -1), s("div", Gn, [(S(!0), o(e, null, E(m.value, (t) => (S(), o("label", {
				key: t.key,
				class: "sp-dev-config-field"
			}, [s("span", Kn, A(t.key), 1), t.type === "choice" ? (S(), o("span", qn, [(S(!0), o(e, null, E(t.choices, (e) => (S(), o("button", {
				key: e,
				class: g(["sp-dev-choice-btn", { active: j(u)[t.key] === e }]),
				onClick: (n) => j(u)[t.key] = e
			}, A(e), 11, Jn))), 128))])) : t.type === "boolean" ? (S(), o("input", {
				key: 1,
				type: "checkbox",
				checked: !!j(u)[t.key],
				onChange: (e) => j(u)[t.key] = e.target.checked
			}, null, 40, Yn)) : t.type === "number" ? (S(), o("input", {
				key: 2,
				type: "range",
				min: t.min ?? 0,
				max: t.max ?? 1,
				step: t.step ?? .01,
				value: j(u)[t.key],
				onInput: (e) => j(u)[t.key] = parseFloat(e.target.value)
			}, null, 40, Xn)) : (S(), o("input", {
				key: 3,
				type: "text",
				value: j(u)[t.key],
				onInput: (e) => j(u)[t.key] = e.target.value
			}, null, 40, Zn))]))), 128))])]),
			c[6] ||= s("footer", { class: "sp-dev-footer" }, [s("small", null, "toolbar ◆ to open")], -1)
		])])) : a("", !0)]));
	}
});
//#endregion
//#region src/composables/useElementScale.ts
function $n(e, t, r) {
	let i = T(0), a = T(0), o = null;
	function s() {
		let t = e.value;
		t && (i.value = t.clientWidth, a.value = t.clientHeight);
	}
	let c = n(() => {
		if (!i.value || !a.value) return 1;
		let e = Math.min(i.value / t, a.value / r);
		return Math.min(e, 1);
	}), l = n(() => {
		let e = c.value;
		return {
			transform: `scale(${e}) translate(${(i.value - t * e) / (2 * e)}px, ${(a.value - r * e) / (2 * e)}px)`,
			transformOrigin: "top left",
			width: t + "px",
			height: r + "px"
		};
	});
	return y(() => {
		s(), e.value && (o = new ResizeObserver(() => {
			s();
		}), o.observe(e.value));
	}), b(() => {
		o?.disconnect();
	}), { transformStyle: l };
}
//#endregion
//#region src/components/SpPresenterView.vue?vue&type=script&setup=true&lang.ts
var er = { class: "sp-presenter-main" }, tr = { class: "sp-presenter-sidebar" }, nr = { class: "sp-presenter-info" }, rr = { class: "sp-presenter-num" }, ir = { class: "sp-presenter-progress" }, ar = ["title"], or = { class: "sp-presenter-clock-time" }, sr = {
	key: 0,
	class: "sp-presenter-clock-feedback"
}, cr = { class: "sp-presenter-notes" }, lr = ["innerHTML"], ur = "sp-presentation-clock", dr = "sp-presentation-log", fr = /* @__PURE__ */ f({
	__name: "SpPresenterView",
	props: {
		current: {},
		currentIndex: {},
		total: {},
		activeHtml: {},
		progressPercent: {},
		blackout: { type: Boolean },
		exitBlackout: { type: Function },
		components: {},
		designWidth: {},
		designHeight: {},
		config: {},
		slides: {}
	},
	setup(e) {
		let t = e, r = p("stepIndex"), c = T(null), u = T(null), { transformStyle: d } = $n(c, t.designWidth, t.designHeight), { transformStyle: f } = $n(u, t.designWidth, t.designHeight), m = T(280), h = !1;
		function g(e) {
			h = !0, document.addEventListener("mousemove", _), document.addEventListener("mouseup", x), e.preventDefault();
		}
		function _(e) {
			if (!h) return;
			let t = window.innerWidth - e.clientX;
			m.value = Math.max(160, Math.min(600, t));
		}
		function x() {
			h = !1, document.removeEventListener("mousemove", _), document.removeEventListener("mouseup", x);
		}
		let C = n(() => ({ gridTemplateColumns: `1fr 6px ${m.value}px` })), w = T(260), E = !1;
		function D(e) {
			E = !0, document.addEventListener("mousemove", O), document.addEventListener("mouseup", k), e.preventDefault();
		}
		function O(e) {
			if (!E) return;
			let t = window.innerHeight - e.clientY;
			w.value = Math.max(120, Math.min(600, t));
		}
		function k() {
			E = !1, document.removeEventListener("mousemove", O), document.removeEventListener("mouseup", k);
		}
		let M = n(() => {
			let e = t.current;
			return e?.notes ? e.notes : "No notes";
		}), ee = n(() => t.currentIndex >= t.total - 1 ? null : t.slides[t.currentIndex + 1] ?? null), te = n(() => Fe(ee.value)), ne = n(() => te.value?.html ?? ""), re = n(() => te.value?.steps ?? 0);
		function P() {
			try {
				let e = localStorage.getItem(ur);
				return e ? JSON.parse(e) : Date.now();
			} catch {
				return Date.now();
			}
		}
		function F() {
			try {
				localStorage.setItem(ur, JSON.stringify(R.value));
			} catch {}
		}
		function ie() {
			try {
				let e = localStorage.getItem(dr);
				return e ? JSON.parse(e) : [];
			} catch {
				return [];
			}
		}
		function I() {
			try {
				localStorage.setItem(dr, JSON.stringify(L.value));
			} catch {}
		}
		let L = T(ie()), R = T(P()), ae = T(Date.now()), oe = null, se = n(() => {
			let e = Math.floor((ae.value - R.value) / 1e3), t = Math.floor(e / 60), n = e % 60;
			return `${String(t).padStart(2, "0")}:${String(n).padStart(2, "0")}`;
		}), ce = n(() => {
			let e = L.value.length;
			return e ? `${e} entries logged` : "";
		});
		function le(e) {
			let n = t.slides[e];
			if (!n) return;
			let r;
			if (n.html) {
				let e = document.createElement("div");
				e.innerHTML = n.html, r = e.querySelector("h1,h2,h3")?.textContent?.trim() || void 0;
			}
			let i = Math.floor((Date.now() - R.value) / 1e3);
			L.value.push({
				slide: e + 1,
				elapsed: i,
				heading: r
			}), I();
		}
		function z(e, t) {
			let n = Math.floor((Date.now() - R.value) / 1e3);
			L.value.push({
				slide: e + 1,
				elapsed: n,
				step: t + 1
			}), I();
		}
		function ue() {
			confirm("Reset timer and clear slide log?") && (R.value = Date.now(), ae.value = Date.now(), L.value = [], F(), I(), de("Reset"));
		}
		function B() {
			let e = new Date(R.value).toLocaleString(), t = ["slide,elapsed_sec,heading"];
			t.push(`0,0,"Started: ${e}"`);
			for (let e of L.value) {
				let n = e.heading ? `"${e.heading.replace(/"/g, "\"\"")}"` : "", r = e.step === void 0 ? String(e.slide) : `${e.slide}.${String(e.step).padStart(2, "0")}`;
				t.push(`${r},${e.elapsed},${n}`);
			}
			let n = t.join("\n");
			navigator.clipboard.writeText(n).catch(() => {});
			let r = new Blob([n], { type: "text/csv;charset=utf-8;" }), i = URL.createObjectURL(r), a = document.createElement("a");
			a.href = i, a.download = `slides-log-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`, a.click(), URL.revokeObjectURL(i), de("Copied + Downloaded");
		}
		let V = T(""), H = null;
		function de(e) {
			V.value = e, H && clearTimeout(H), H = setTimeout(() => {
				V.value = "";
			}, 1500);
		}
		return N(() => [r.value, t.currentIndex], ([e, n], [r, i]) => {
			e === r ? t.config.logSteps && n !== i && z(e, n) : le(e);
		}), y(() => {
			R.value = P(), F(), ae.value = Date.now(), oe = setInterval(() => {
				ae.value = Date.now();
			}, 1e3), le(t.currentIndex);
		}), b(() => {
			oe && clearInterval(oe), x(), k();
		}), (t, n) => (S(), o("div", {
			class: "sp-presenter-layout",
			style: v(C.value)
		}, [
			s("div", er, [
				s("div", {
					class: "sp-presenter-preview",
					ref_key: "previewContainerEl",
					ref: c
				}, [s("div", {
					style: v(j(d)),
					class: "sp-slide-scaler"
				}, [e.current ? (S(), i(jn, {
					key: e.currentIndex,
					slide: e.current,
					html: e.activeHtml,
					components: e.components
				}, null, 8, [
					"slide",
					"html",
					"components"
				])) : a("", !0)], 4)], 512),
				s("div", {
					class: "sp-presenter-vdivider",
					onMousedown: D
				}, null, 32),
				s("div", {
					class: "sp-presenter-next",
					style: v({ height: w.value + "px" })
				}, [n[1] ||= s("div", { class: "sp-presenter-next-label" }, "Next", -1), s("div", {
					class: "sp-presenter-next-slide-wrap",
					ref_key: "nextContainerEl",
					ref: u
				}, [s("div", {
					style: v(j(f)),
					class: "sp-slide-scaler"
				}, [ee.value ? (S(), i(jn, {
					key: "next-" + (e.currentIndex + 1),
					slide: ee.value,
					html: ne.value,
					fixedStep: re.value - 1,
					components: e.components
				}, null, 8, [
					"slide",
					"html",
					"fixedStep",
					"components"
				])) : a("", !0)], 4)], 512)], 4)
			]),
			s("div", {
				class: "sp-presenter-divider",
				onMousedown: g
			}, null, 32),
			s("div", tr, [s("div", nr, [
				s("div", rr, [l(A(e.currentIndex + 1) + " ", 1), s("small", null, "/ " + A(e.total), 1)]),
				s("div", ir, [s("div", {
					class: "sp-presenter-progress-bar",
					style: v({ width: e.progressPercent + "%" })
				}, null, 4)]),
				s("div", {
					class: "sp-presenter-clock",
					title: ce.value
				}, [
					s("span", or, A(se.value), 1),
					V.value ? (S(), o("span", sr, A(V.value), 1)) : a("", !0),
					s("span", { class: "sp-presenter-clock-actions" }, [s("button", {
						class: "sp-presenter-clock-btn",
						title: "Export log (CSV)",
						onClick: B
					}, "⬇"), s("button", {
						class: "sp-presenter-clock-btn",
						title: "Reset timer",
						onClick: ue
					}, "↺")])
				], 8, ar),
				e.blackout ? (S(), o("div", {
					key: 0,
					class: "sp-presenter-blackout-badge",
					onClick: n[0] ||= (...t) => e.exitBlackout && e.exitBlackout(...t)
				}, "BLACKED OUT")) : a("", !0)
			]), s("div", cr, [n[2] ||= s("h3", null, "Speaker Notes", -1), s("div", {
				class: "sp-presenter-notes-content",
				innerHTML: M.value
			}, null, 8, lr)])])
		], 4));
	}
}), pr = { class: "sp-overview-thumb-num" }, mr = /* @__PURE__ */ f({
	__name: "SpPrintView",
	props: {
		steps: { type: Boolean },
		components: {},
		designWidth: {},
		designHeight: {},
		config: {},
		slides: {},
		currentIndex: { default: 0 },
		stepIndex: { default: 0 }
	},
	setup(t) {
		let r = t, a = n(() => r.slides.map((e) => Fe(e))), l = n(() => ({
			width: `${r.designWidth}px`,
			height: `${r.designHeight}px`
		})), d = n(() => `
@page {
  size: ${r.designWidth}px ${r.designHeight}px;
}
`), f = n(() => a.value.map((e) => Math.max(1, Math.floor(e.steps)))), p = n(() => {
			let e = [], t = 0;
			for (let n of f.value) e.push(t), t += n;
			return e;
		}), m = n(() => {
			if (r.slides.length === 0) return 0;
			let e = Math.min(Math.max(r.currentIndex, 0), r.slides.length - 1);
			if (!r.steps) return e;
			let t = Math.min(Math.max(r.stepIndex, 0), f.value[e] - 1);
			return p.value[e] + t;
		}), g = n(() => r.steps ? r.slides.flatMap((e, t) => {
			let n = f.value[t];
			return [...Array(n).keys()].map((n) => ({
				step: n,
				slide: e,
				slideI: t,
				html: a.value[t].html
			}));
		}) : r.slides.map((e, t) => ({
			slide: e,
			slideI: t,
			html: a.value[t].html,
			step: a.value[t].steps - 1
		}))), _ = T(null), b = T(!1);
		function x(e) {
			_.value?.querySelectorAll(".sp-print-wrapper").item(e)?.scrollIntoView({ block: "start" });
		}
		return N(m, (e, t) => {
			!b.value || e === t || h(() => x(e));
		}), y(() => {
			b.value = !0;
		}), (n, r) => (S(), o("div", {
			class: "sp-print",
			ref_key: "printRootEl",
			ref: _
		}, [
			r[0] ||= c("<div class=\"sp-print-helper-container\"><div class=\"sp-print-helper\"><p>To export as PDF:</p><ul><li><kbd>Ctrl</kbd> + <kbd>P</kbd> (open the print dialog)</li><li>Select &quot;Save as/to PDF&quot; (or similar)</li><li>Select &quot;Margins&quot; as &quot;None&quot;</li><li><input type=\"checkbox\" checked disabled> Check &quot;Print backgrounds&quot; </li><li><input type=\"checkbox\" disabled> Uncheck &quot;Print headers and footers&quot; </li><li>Click &quot;Save&quot;</li></ul><p><label>Dismiss this dialog! (reload to get back)<input type=\"checkbox\"></label></p></div></div>", 1),
			(S(!0), o(e, null, E(g.value, ({ slide: e, slideI: n, html: r, step: i }, a) => (S(), o("div", {
				key: a,
				class: "sp-print-wrapper",
				style: v(l.value)
			}, [u(jn, {
				slide: e,
				style: v(l.value),
				html: r,
				fixedStep: i,
				components: t.components
			}, null, 8, [
				"slide",
				"style",
				"html",
				"fixedStep",
				"components"
			]), s("div", pr, A(n + 1), 1)], 4))), 128)),
			(S(), i(O("style"), { innerHTML: d.value }, null, 8, ["innerHTML"]))
		], 512));
	}
}), hr = { class: "sp-overview-grid" }, gr = ["onClick"], _r = { class: "sp-overview-thumb-stage" }, vr = { class: "sp-overview-thumb-num" }, yr = /* @__PURE__ */ f({
	__name: "SpOverview",
	props: {
		slides: {},
		currentIndex: {},
		slideHeadingLevels: {},
		overviewThumbStyle: {},
		overviewSlideStyle: {},
		components: {}
	},
	emits: ["close", "select"],
	setup(t) {
		let r = t, i = n(() => r.slides.map((e) => Fe(e)));
		return (n, r) => (S(), o("div", {
			class: "sp-overview",
			onClick: r[0] ||= F((e) => n.$emit("close"), ["self"])
		}, [s("div", hr, [(S(!0), o(e, null, E(t.slides, (e, r) => (S(), o("div", {
			key: r,
			class: g(["sp-overview-thumb", {
				active: r === t.currentIndex,
				"sp-overview-h1": t.slideHeadingLevels[r] === 1,
				"sp-overview-h2": t.slideHeadingLevels[r] === 2,
				"sp-overview-h3": t.slideHeadingLevels[r] === 3
			}]),
			style: v(t.overviewThumbStyle),
			onClick: (e) => n.$emit("select", r)
		}, [s("div", _r, [s("div", { style: v(t.overviewSlideStyle) }, [u(jn, {
			slide: e,
			html: i.value[r].html,
			fixedStep: i.value[r].steps - 1,
			components: t.components
		}, null, 8, [
			"slide",
			"html",
			"fixedStep",
			"components"
		])], 4)]), s("div", vr, A(r + 1), 1)], 14, gr))), 128))])]));
	}
}), br = { class: "sp-go-prompt-box" }, xr = ["onKeydown"], Sr = {
	key: 0,
	class: "sp-go-results"
}, Cr = ["onClick", "onMouseenter"], wr = { class: "sp-go-result-thumb" }, Tr = { class: "sp-go-result-text" }, Er = { class: "sp-go-result-num" }, Dr = ["innerHTML"], Or = {
	key: 1,
	class: "sp-go-no-results"
}, kr = /* @__PURE__ */ f({
	__name: "SpGoPrompt",
	props: {
		slides: {},
		designWidth: {},
		designHeight: {},
		components: {},
		total: {}
	},
	emits: ["close", "select"],
	setup(t, { emit: r }) {
		let i = t, c = r, l = n(() => i.slides.map((e) => Fe(e))), d = T(""), f = T(0), p = T(null), m = n(() => i.slides.map((e, t) => {
			let n = document.createElement("div");
			n.innerHTML = e.html;
			let r = [];
			return n.querySelectorAll("h1,h2,h3").forEach((e) => {
				let t = e.textContent?.trim();
				t && r.push(t);
			}), {
				index: t,
				texts: r
			};
		})), _ = n(() => {
			let e = d.value.trim().toLowerCase();
			if (!e || /^\d+$/.test(e)) return [];
			let t = [];
			for (let n of m.value) {
				let r = [];
				for (let t of n.texts) t.toLowerCase().includes(e) && r.push(t);
				r.length && t.push({
					index: n.index,
					matches: r
				});
			}
			return t;
		});
		N(_, () => {
			f.value = 0;
		});
		let b = n(() => ({
			transform: `scale(${210 / i.designWidth})`,
			transformOrigin: "top left",
			width: i.designWidth + "px",
			height: i.designHeight + "px"
		}));
		function x(e) {
			let t = d.value.trim();
			if (!t) return C(e);
			let n = e.toLowerCase(), r = t.toLowerCase(), i = [], a = 0;
			for (; a < e.length;) {
				let o = n.indexOf(r, a);
				if (o === -1) {
					i.push(C(e.slice(a)));
					break;
				}
				i.push(C(e.slice(a, o))), i.push("<mark>" + C(e.slice(o, o + t.length)) + "</mark>"), a = o + t.length;
			}
			return i.join("");
		}
		function C(e) {
			return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		}
		function w() {
			f.value < _.value.length - 1 && f.value++;
		}
		function D() {
			f.value > 0 && f.value--;
		}
		function O() {
			let e = d.value.trim();
			if (e) {
				if (/^\d+$/.test(e)) {
					let t = parseInt(e, 10);
					t >= 1 && t <= i.total && c("select", t - 1);
					return;
				}
				if (_.value.length > 0) {
					let e = _.value[f.value]?.index ?? _.value[0].index;
					c("select", e);
				}
			}
		}
		function k(e) {
			c("select", e);
		}
		return y(() => {
			h(() => p.value?.focus());
		}), (n, r) => (S(), o("div", {
			class: "sp-go-prompt",
			onClick: r[2] ||= F((e) => n.$emit("close"), ["self"])
		}, [s("div", br, [re(s("input", {
			ref_key: "goPromptInput",
			ref: p,
			"onUpdate:modelValue": r[0] ||= (e) => d.value = e,
			class: "sp-go-prompt-input",
			placeholder: "slide number or search text…",
			onKeydown: [
				P(O, ["enter"]),
				r[1] ||= P((e) => n.$emit("close"), ["escape"]),
				P(F(w, ["prevent"]), ["down"]),
				P(F(D, ["prevent"]), ["up"])
			]
		}, null, 40, xr), [[ee, d.value]]), _.value.length ? (S(), o("div", Sr, [(S(!0), o(e, null, E(_.value, (n, r) => (S(), o("div", {
			key: n.index,
			class: g(["sp-go-result", { focused: r === f.value }]),
			onClick: (e) => k(n.index),
			onMouseenter: (e) => f.value = r
		}, [s("div", wr, [s("div", { style: v(b.value) }, [u(jn, {
			slide: t.slides[n.index],
			html: l.value[n.index].html,
			components: t.components
		}, null, 8, [
			"slide",
			"html",
			"components"
		])], 4)]), s("div", Tr, [s("div", Er, "Slide " + A(n.index + 1), 1), (S(!0), o(e, null, E(n.matches, (e, t) => (S(), o("div", {
			key: t,
			class: "sp-go-result-heading",
			innerHTML: x(e)
		}, null, 8, Dr))), 128))])], 42, Cr))), 128))])) : d.value && !/^\d*$/.test(d.value) ? (S(), o("div", Or, " No slides match \"" + A(d.value) + "\" ", 1)) : a("", !0)])]));
	}
});
//#endregion
//#region src/export.ts
async function Ar() {
	let e = document.getElementById("sp-content");
	if (!e) throw Error("Export failed: #sp-content not found");
	let t = e.textContent?.trim() || "";
	t = Ee(t);
	let n = document.createElement("div");
	n.innerHTML = t, n.querySelectorAll("img[src]").forEach((e) => {
		let t = e.getAttribute("src");
		if (!t || t.startsWith("data:") || t.startsWith("blob:")) return;
		let n = document.createElement("sp-img");
		n.setAttribute("src", t), e.replaceWith(n);
	}), t = n.innerHTML;
	let r = [], i = document.querySelectorAll("link[rel=\"stylesheet\"]");
	for (let e of i) {
		let t = e.getAttribute("href");
		if (t && !t.includes("slides-purryst")) try {
			let e = await fetch(new URL(t, window.location.href).href);
			e.ok && r.push(await e.text());
		} catch {}
	}
	document.querySelectorAll("head style").forEach((e) => {
		B.has(e) || e.hasAttribute("data-vite-dev-id") || r.push(e.textContent ?? "");
	});
	let a = `<template id="sp-cache">${Je().replace(/</g, "&lt;")}</template>`, o = document.getElementById("sp-init")?.outerHTML ?? "", s = {};
	for (let [e, t] of Object.entries(ue)) t != null && (s[e] = t);
	let c = JSON.stringify(s, null, 2).replace(/"([^"]+)":/g, "$1:"), l = Array.from(document.documentElement.classList).find((e) => e.startsWith("theme-")) ?? "", u = `<!DOCTYPE html>
<html lang="en"${l ? ` class="${l}"` : ""}>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Presentation</title>
${r.length ? `<style>\n${r.join("\n")}\n</style>` : ""}
</head>
<body>
<div id="app"></div>
<script type="text/html" id="sp-content">
${t}
<\/script>
${a}
${o}
<script src="./slides-purryst.bundle.js"><\/script>
<script>
(async () => { await SlidesPurryst.createSlidesPurryst(${c}) })()
<\/script>
</body>
</html>`, d = new Blob([u], { type: "text/html" }), f = URL.createObjectURL(d), p = document.createElement("a");
	p.href = f, p.download = "presentation-standalone.html", document.body.appendChild(p), p.click(), document.body.removeChild(p), URL.revokeObjectURL(f);
}
//#endregion
//#region src/composables/useCodeHighlight.ts
var jr = null, Mr = null;
async function Nr() {
	if (!jr) return Mr || (Mr = (async () => {
		try {
			let { createHighlighter: e } = await import("shiki");
			jr = await e({
				langs: [
					"ts",
					"js",
					"tsx",
					"jsx",
					"html",
					"css",
					"json",
					"bash",
					"sh",
					"python",
					"rust",
					"go",
					"vue"
				],
				themes: ["dark-plus", "material-theme"]
			});
		} catch {
			jr = null;
		}
	})(), Mr);
}
function Pr(e) {
	for (let t of e.classList) {
		if (t.startsWith("language-")) return t.slice(9);
		if (t.startsWith("lang-")) return t.slice(5);
	}
	let t = e.closest("[class*=\"language-\"]");
	if (t) {
		for (let e of t.classList) if (e.startsWith("language-")) return e.slice(9);
	}
	return null;
}
async function Fr(e) {
	if (await Nr(), !jr) return e;
	let t = document.createElement("div");
	t.innerHTML = e;
	let n = t.querySelectorAll("pre");
	for (let e of n) {
		let t = e.querySelector("code");
		if (!t) continue;
		let n = Pr(t);
		if (!n) continue;
		let r = t.textContent || "";
		try {
			e.outerHTML = jr.codeToHtml(r, {
				lang: n,
				theme: "dark-plus"
			});
		} catch {}
	}
	return t.innerHTML;
}
//#endregion
//#region src/components/SpPresentation.vue?vue&type=script&setup=true&lang.ts
var Ir = ["data-source-file-push"], Lr = { class: "sp-global-error" }, Rr = {
	key: 0,
	class: "sp-loading"
}, zr = { class: "sp-global-top" }, Br = { class: "sp-global-bottom" }, Vr = { class: "sp-slide-footer" }, Hr = { class: "sp-chunklet-hint" }, Ur = {
	key: 0,
	class: "sp-save-spinner",
	"aria-hidden": "true"
}, Wr = { class: "sp-nav-bar" }, Gr = ["title"], Kr = ["disabled"], qr = ["disabled"], Jr = {
	key: 0,
	class: "sp-nav-more-menu"
}, Yr = { class: "sp-nav-more-icon" }, Xr = { class: "sp-nav-more-item sp-nav-more-browse" }, Zr = { class: "sp-nav-pills" }, Qr = {
	key: 0,
	class: "sp-nav-pill-ellipsis"
}, $r = ["onClick", "aria-label"], ei = {
	key: 1,
	class: "sp-chunklets-bar"
}, ti = ["onClick"], ni = { class: "sp-chunklets-bar-badge" }, ri = { class: "sp-progress" }, ii = /* @__PURE__ */ f({
	__name: "SpPresentation",
	props: {
		slides: {},
		rawSlideSources: {},
		transition: { default: "none" },
		transitionDuration: { default: 200 },
		presenter: {
			type: Boolean,
			default: !1
		},
		print: {
			type: [Boolean, String],
			default: !1
		},
		designWidth: { default: 1920 },
		designHeight: { default: 1080 },
		author: { default: "" },
		components: { default: () => ({}) },
		seed: { default: 12345678 },
		raw: {}
	},
	setup(t, { expose: r }) {
		let c = t, d = n(() => c.print === "slides" ? "print-slides" : c.print === "steps" ? "print-steps" : c.presenter ? "presenter" : "main"), { slides: p, currentIndex: m, current: _, total: w, goTo: M, nextSlide: ee, prevSlide: P, setSlides: ie } = le(c.slides), { stepIndex: I, totalSteps: L, isFirstStep: R, isLastStep: ae, nextStep: oe, prevStep: ue } = Pe(), B = !1, V = null, H = T(0), de = k(null), fe = k(null);
		N(() => c.raw?.before, (e) => {
			if (!e) {
				de.value = null;
				return;
			}
			de.value = f({
				template: `<div style="display:contents" class="sp-raw-before">${e}</div>`,
				components: c.components
			});
		}, { immediate: !0 }), N(() => c.raw?.after, (e) => {
			if (!e) {
				fe.value = null;
				return;
			}
			fe.value = f({
				template: `<div style="display:contents" class="sp-raw-after">${e}</div>`,
				components: c.components
			});
		}, { immediate: !0 });
		let { openPresenterWindow: pe, closePresenter: me, presenterActive: he, syncState: ge, syncBlackout: _e, send: ve, onMessage: ye, channel: be } = xt(), { transformStyle: xe, containerStyle: Se } = St(c.designWidth, c.designHeight), we = T(null), G = T(null), Te = T(null);
		kt({
			currentIndex: m,
			stepIndex: I,
			contentVersion: H,
			root: () => Te.value
		}), C("stepIndex", I), C("slideIndex", m), C("contentVersion", H), C("slides", p), C("goTo", M), C("sp-components", c.components);
		let K = T(c.rawSlideSources ?? p.value.map((e) => e.html));
		C("rawSlideSources", K), vn(() => {
			gn.value && (K.value = kn());
		});
		let ke = T(1), Ae = T(!1), je = n(() => window.location.pathname);
		N(m, (e, t) => {
			e !== t && (ke.value = e > t ? 1 : -1, Ae.value = !0, pn());
		});
		let q = n(() => {
			let e = _.value?.transition ?? c.transition;
			return e === "" ? "none" : e;
		}), Me = n(() => {
			let e = `sp-${q.value}`;
			return q.value === "none" ? e : `${e} sp-dir-${ke.value === 1 ? "forward" : "backward"}`;
		}), Ie = n(() => q.value === "none" ? 0 : _.value?.transitionDuration ?? c.transitionDuration), Le = n(() => ({
			"--sp-design-width": `${c.designWidth}px`,
			"--sp-design-height": `${c.designHeight}px`,
			"--sp-transition-duration": `${Ie.value}ms`
		}));
		x(() => {
			q.value === "none" || !Ae.value || !G.value || (Ae.value = !1, G.value.classList.add("sp-swapping"), G.value.offsetHeight, G.value.classList.remove("sp-swapping"));
		});
		let Re = n(() => m.value === 0), ze = n(() => m.value === w.value - 1), Be = n(() => w.value === 0 ? 0 : (m.value + 1) / w.value * 100), Ve = n(() => {
			let e = Ue.value;
			if (e <= 23) return Array.from({ length: e }, (e, t) => ({
				type: "pill",
				index: t
			}));
			let t = [], n = m.value, r = Math.max(5, n - 5), i = Math.min(e - 1 - 5, n + 5);
			for (let e = 0; e < 5; e++) t.push({
				type: "pill",
				index: e
			});
			r > 5 && t.push({
				type: "ellipsis",
				id: "pre"
			});
			for (let e = r; e <= i; e++) t.push({
				type: "pill",
				index: e
			});
			i < e - 1 - 5 && t.push({
				type: "ellipsis",
				id: "post"
			});
			for (let n = e - 5; n < e; n++) t.push({
				type: "pill",
				index: n
			});
			return t;
		}), He = n(() => {
			let e = p.value.map((e, t) => e.fakeEnd ? t : -1).filter((e) => e >= 0), t = w.value - 1;
			return t >= 0 && !e.includes(t) && e.push(t), e.sort((e, t) => e - t);
		}), J = n(() => He.value.find((e) => e >= m.value) ?? w.value - 1), Ue = n(() => J.value + 1), We = n(() => Fe(_.value)), Ge = n(() => We.value?.html ?? "");
		function Ke() {
			ae.value ? m.value < w.value - 1 && ee() : oe();
		}
		function qe() {
			R.value ? m.value > 0 && P() : ue();
		}
		let Je = n(() => m.value === 0 ? null : p.value[m.value - 1] ?? null), Ye = n(() => Fe(Je.value)), Xe = n(() => Ye?.value?.html ?? ""), Ze = n(() => Ye?.value?.steps ?? 0), Qe = n(() => m.value >= w.value - 1 ? null : p.value[m.value + 1] ?? null), $e = n(() => Fe(Qe.value)), et = n(() => $e?.value?.html ?? "");
		n(() => $e?.value?.steps ?? "");
		function tt() {
			document.fullscreenElement ? document.exitFullscreen().catch(() => {}) : document.documentElement.requestFullscreen().catch(() => {});
		}
		function nt() {
			he.value ? me() : pe();
		}
		let Y = Dt();
		z.config = Y;
		function it() {
			try {
				let e = sessionStorage.getItem("sp-live-overview");
				return sessionStorage.removeItem("sp-live-overview"), e === "1";
			} catch {
				return !1;
			}
		}
		let at = T(it());
		N(at, (e) => {
			z.overview = e;
		}, { immediate: !0 }), Bt();
		let ot = T(!1), X = T(!1), st = T(!0), ct = T(!1), lt = T(null);
		function ut(e) {
			let t = document.documentElement;
			e === "auto" ? t.removeAttribute("data-dark-mode") : t.dataset.darkMode = e;
		}
		function dt() {
			Y.darkMode = Y.darkMode === "dark" ? "light" : "dark";
		}
		let ft = n(() => Y.darkMode === "dark" ? "Dark" : "Light"), pt = n(() => Y.darkMode === "dark" ? "●" : "○");
		N(() => Y.darkMode, ut, { immediate: !0 }), ne(() => {
			z.navLocked = Y.navLocked, z.currentIndex = m.value, z.stepIndex = I.value, z.total = w.value, z.effectiveLast = J.value, z.effectiveTotal = Ue.value, z.fakeEndIndices = He.value;
		}), z.toggleNavLock = () => {
			Y.navLocked = !Y.navLocked;
		}, z.goTo = M, z.next = Ke, z.prev = qe, z.nextSlide = ee, z.prevSlide = P, z.export = Ar;
		let mt = n(() => ({
			width: c.designWidth * Y.overviewScale + "px",
			height: c.designHeight * Y.overviewScale + "px"
		})), ht = n(() => ({
			transform: `scale(${Y.overviewScale})`,
			transformOrigin: "top left",
			width: c.designWidth + "px",
			height: c.designHeight + "px"
		})), gt = n(() => p.value.map((e) => {
			let t = document.createElement("div");
			t.innerHTML = e.html;
			let n = t.querySelector("h1,h2,h3");
			return n ? parseInt(n.tagName[1]) : 0;
		}));
		function _t(e) {
			at.value = !1, V = 0, M(e);
		}
		let vt = T(!1);
		function yt() {
			vt.value = !0;
		}
		function Ct() {
			vt.value = !1;
		}
		function wt(e) {
			Ct(), M(e);
		}
		N(_, (e, t) => {
			L.value = Ne(e.html).steps, t?.num !== e?.num && (V === null ? B ? (I.value = Math.min(Math.max(I.value, 0), Math.max(0, L.value - 1)), B = !1) : ke.value === -1 ? I.value = Math.max(0, L.value - 1) : I.value = 0 : (I.value = Math.min(Math.max(V, 0), Math.max(0, L.value - 1)), V = null));
		});
		let Tt = T(!1);
		N([m, I], () => {
			Tt.value || ge(m.value, I.value);
		}, { flush: "post" }), N([m, I], () => {
			c.presenter || Et();
		}, { flush: "post" });
		function Et() {
			let e = `#${m.value}/${I.value}`;
			history.replaceState(null, "", e);
		}
		function Ot() {
			let e = location.hash.match(/^#(\d+)(?:\/(\d+))?$/);
			if (!e) return;
			let t = parseInt(e[1], 10), n = e[2] === void 0 ? 0 : parseInt(e[2], 10);
			t >= 0 && t < w.value && (t !== m.value && (B = !0), M(t), I.value = n);
		}
		function At() {
			Ot();
		}
		ye("sync", (e) => {
			Tt.value = !0, e.slide !== m.value && (B = !0), M(e.slide), I.value = e.step, h(() => {
				Tt.value = !1;
			});
		}), ye("presenter-ready", () => {
			ge(m.value, I.value);
		}), ye("presenter-close", () => {
			me();
		}), ye("blackout", (e) => {
			X.value = e.active;
		}), c.presenter && (ve("presenter-ready"), window.addEventListener("beforeunload", () => {
			ve("presenter-close");
		}));
		function jt() {
			X.value = !X.value, _e(X.value);
		}
		function Ft() {
			X.value && (X.value = !1, _e(!1));
		}
		let Q = [...U._keymapSetups];
		U.applyAnimRegistrations();
		let { rebuildKeymap: It } = bt({
			next: Ke,
			prev: qe,
			goTo: M,
			goToPrevBegin: zt,
			goToNextBegin: $,
			goToPrevEnd: Vt,
			goToNextEnd: Ht,
			currentIndex: m,
			current: _,
			total: w,
			nextStep: oe,
			prevStep: ue,
			stepIndex: I,
			totalSteps: L,
			isLastStep: ae,
			isFirstStep: R,
			onPresenterToggle: nt,
			onOverviewToggle: () => at.value = !at.value,
			onOverviewExit: () => {
				at.value = !1;
			},
			onGoPrompt: yt,
			onBlackoutToggle: jt,
			onBlackoutExit: Ft,
			onDevPaneToggle: () => {
				Y.proMode ? Ut() : dt();
			},
			onChunkBarToggle: Yt
		}, {
			getContext: () => ({
				overview: at.value,
				presenter: he.value,
				blackout: X.value,
				devPane: ot.value,
				dragging: z.dragging,
				goPrompt: vt.value
			}),
			extraSetups: Q
		});
		y(() => {
			_.value && (L.value = Ne(_.value.html).steps), c.presenter ? st.value = !1 : (Ot(), h(() => {
				Et(), st.value = !1;
			}), window.addEventListener("hashchange", At)), document.addEventListener("click", Wt, !0), Lt(c.seed), Rt();
		});
		function Lt(e) {
			if (document.head.querySelectorAll("link[rel=icon]").length == 0) {
				let [t, n, r, i, a] = [
					"🐯",
					-20,
					14,
					-.85,
					1
				], o = (180 + (e - 12345678)) % 360, s = document.createElement("link");
				s.setAttribute("rel", "icon"), s.setAttribute("type", "image/svg+xml"), s.setAttribute("href", `data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20style='filter:hue-rotate(${o}deg)'%20viewBox='0%200%2016%2016'%3E%3Ctext%20transform='scale(${i},${a})'%20x='${n}'%20y='${r}'%3E${t}%3C/text%3E%3C/svg%3E`), document.head.append(s);
			}
		}
		async function Rt() {
			for (let e = 0; e < p.value.length; e++) {
				let t = p.value[e], n = await Fr(t.html);
				n !== t.html && (p.value[e] = {
					...t,
					html: n
				});
			}
		}
		b(() => {
			document.removeEventListener("click", Wt, !0), window.removeEventListener("hashchange", At), window.removeEventListener("keydown", sn);
		});
		function zt() {
			I.value > 0 ? I.value = 0 : m.value > 0 && (V = 0, M(m.value - 1));
		}
		function Vt() {
			m.value > 0 && M(m.value - 1);
		}
		function $() {
			m.value < w.value - 1 && (V = 0, M(m.value + 1));
		}
		function Ht() {
			I.value < L.value - 1 ? I.value = Ne(p.value[m.value].html).steps - 1 : m.value < w.value - 1 && (V = Math.max(0, Ne(p.value[m.value + 1].html).steps - 1), M(m.value + 1));
		}
		function Ut() {
			ot.value = !ot.value;
		}
		function Wt(e) {
			ct.value && lt.value && !lt.value.contains(e.target) && (ct.value = !1);
		}
		let Gt = n(() => {
			let e = z.selectedChunklet;
			return e ? Nt(e) : "click";
		});
		function Kt(e) {
			let t = e.currentTarget;
			if (!t) return {
				x: 0,
				y: 0
			};
			let n = t.getBoundingClientRect(), r = Pt();
			return {
				x: Math.round((e.clientX - n.left) / r),
				y: Math.round((e.clientY - n.top) / r)
			};
		}
		function qt(e, t) {
			if (!e) return;
			let n = m.value, r = p.value[n];
			if (e.kind === "typst") {
				let i = Mt(e.html, t), a = `<div class="sp-chunklet-placeholder">chunklet: ${e.name}</div>`;
				p.value = p.value.map((e, t) => t === n ? {
					...e,
					html: e.html + "\n" + a
				} : e), K.value[n] && (K.value = K.value.map((e, t) => t === n ? e + "\n" + a : e)), L.value = Ne(_.value.html).steps, H.value++, z.chunkletMode = !1, z.selectedChunklet = null, Xt(i, r.editableIndex, e, {
					file: r.sourceFile,
					sourceLine: r.sourceLine
				});
				return;
			}
			let i = Mt(e.html, t), a = r.html;
			p.value = p.value.map((e, t) => t === n ? {
				...e,
				html: a + "\n" + i
			} : e), K.value[n] && (K.value = K.value.map((e, t) => t === n ? e + "\n" + i : e)), L.value = Ne(_.value.html).steps, H.value++, z.chunkletMode = !1, z.selectedChunklet = null, Xt(i, r.editableIndex);
		}
		function Jt(e) {
			if (z.selectedChunklet === e && z.chunkletMode) {
				an();
				return;
			}
			z.selectedChunklet = e, z.chunkletMode = !0;
		}
		function Yt() {
			z.showChunkletsBar = !z.showChunkletsBar;
		}
		function Xt(e, t, n, r) {
			let i = G.value?.querySelector(".sp-slide-current");
			if (n?.kind === "typst") {
				let n = r?.file ?? null, i = r?.sourceLine == null ? null : String(r.sourceLine);
				n && i && fetch("/__sp_edit", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "insert-chunk",
						kind: "typst",
						src: e,
						file: n,
						sourceLine: i,
						editableIndex: t
					})
				}).catch(() => {});
				return;
			}
			let a = G.value?.querySelector(".sp-slide-current [data-source-file-push] + *") ?? i, o = i ? rt(a) : null;
			fetch("/__sp_edit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "insert-chunk",
					html: e,
					file: o,
					editableIndex: t
				})
			}).catch(() => {});
		}
		let Zt = T({
			x: 0,
			y: 0
		}), Qt = T({
			x: 0,
			y: 0
		}), $t = T(!1), en = n(() => {
			let e = Math.min(Zt.value.x, Qt.value.x), t = Math.min(Zt.value.y, Qt.value.y), n = Math.abs(Qt.value.x - Zt.value.x), r = Math.abs(Qt.value.y - Zt.value.y);
			return {
				left: e + "px",
				top: t + "px",
				width: n + "px",
				height: r + "px"
			};
		});
		function tn(e) {
			e.preventDefault(), Zt.value = Kt(e), Qt.value = { ...Zt.value }, $t.value = !0;
		}
		function nn(e) {
			$t.value && (Qt.value = Kt(e));
		}
		function rn(e) {
			if (!$t.value) return;
			$t.value = !1;
			let t = z.selectedChunklet;
			if (!t) return;
			let n = Nt(t), r = Zt.value, i = Qt.value, a = Math.abs(i.x - r.x), o = Math.abs(i.y - r.y);
			n === "drag" && !(a < 5 && o < 5) ? qt(t, {
				x: Math.min(r.x, i.x),
				y: Math.min(r.y, i.y),
				w: Math.abs(i.x - r.x),
				h: Math.abs(i.y - r.y)
			}) : qt(t, {
				x: r.x,
				y: r.y
			});
		}
		function an() {
			z.chunkletMode = !1, z.selectedChunklet = null, $t.value = !1;
		}
		let on = T(null);
		N(() => z.chunkletMode, (e) => {
			e ? window.addEventListener("keydown", sn) : window.removeEventListener("keydown", sn);
		}), N(() => z.dragging, (e) => {
			if (!e && on.value != null) {
				let e = on.value;
				on.value = null, cn(e);
			}
		});
		function sn(e) {
			e.key === "Escape" && an();
		}
		function cn(e) {
			if (ln() || z.dragging) {
				on.value = e;
				return;
			}
			on.value = null, e = On(e), gn.value = e, K.value = ce(e);
			let t = Oe(De(Ee(e))), n = document.createElement("div");
			n.innerHTML = t;
			let r = se(n);
			if (r.length === 0) return;
			let i = m.value, a = I.value, o = Math.min(i, r.length - 1);
			B = !0, ie(r), m.value = o, L.value = Ne(_.value.html).steps, o === i ? (I.value = Math.min(a, L.value - 1), B = !1) : I.value = 0, Rt().then(() => {
				H.value++;
			});
		}
		return r({ updateSlides: cn }), (n, r) => (S(), o("div", {
			ref_key: "rootEl",
			ref: Te,
			class: g(["sp-presentation", { "sp-presenter-mode": t.presenter }]),
			style: v(Le.value)
		}, [
			s("span", {
				style: { display: "none" },
				"data-source-file-push": je.value
			}, null, 8, Ir),
			c.raw?.before ? (S(), i(O(de.value), { key: 0 })) : a("", !0),
			j(W).length > 0 ? (S(), o("div", {
				key: 1,
				class: "sp-global-error-overlay",
				onClick: r[0] ||= F((e) => j(Ce)(), ["self"])
			}, [s("div", Lr, [r[15] ||= s("h3", null, "Global Errors", -1), s("ul", null, [(S(!0), o(e, null, E(j(W), (e, t) => (S(), o("li", { key: t }, A(e), 1))), 128))])])])) : a("", !0),
			d.value == "main" ? (S(), o(e, { key: 2 }, [
				st.value ? (S(), o("div", Rr, [...r[16] ||= [s("div", { class: "sp-loading-text" }, "Loading…", -1)]])) : a("", !0),
				re(s("div", {
					class: "sp-viewport",
					style: v(j(Se)),
					ref_key: "viewportEl",
					ref: we
				}, [s("div", {
					class: "sp-scale-wrap",
					style: v(j(xe))
				}, [
					s("div", zr, [D(n.$slots, "global-top")]),
					s("div", {
						class: g(Me.value),
						ref_key: "transitionWrapEl",
						ref: G
					}, [
						Je.value ? (S(), i(jn, {
							class: "sp-slide-prev",
							key: j(m) - 1,
							slide: Je.value,
							html: Xe.value,
							fixedStep: Ze.value - 1,
							components: c.components
						}, null, 8, [
							"slide",
							"html",
							"fixedStep",
							"components"
						])) : a("", !0),
						j(_) ? (S(), i(jn, {
							class: "sp-slide-current",
							key: j(m),
							slide: j(_),
							html: Ge.value,
							components: c.components
						}, null, 8, [
							"slide",
							"html",
							"components"
						])) : a("", !0),
						Qe.value ? (S(), i(jn, {
							class: "sp-slide-next",
							key: j(m) + 1,
							slide: Qe.value,
							html: et.value,
							fixedStep: 0,
							components: c.components
						}, null, 8, [
							"slide",
							"html",
							"components"
						])) : a("", !0)
					], 2),
					s("div", Br, [D(n.$slots, "global-bottom", {}, () => [s("footer", Vr, [s("span", null, A(j(z).config.speaker), 1), s("span", null, A(j(m) + 1) + " / " + A(Ue.value), 1)])])]),
					j(z).chunkletMode ? (S(), o("div", {
						key: 0,
						class: g(["sp-chunklet-overlay", { "sp-chunklet-drag": Gt.value === "drag" }]),
						onPointerdown: tn,
						onPointermove: nn,
						onPointerup: rn
					}, [s("div", Hr, [l(A(Gt.value === "drag" ? "Click + drag to draw " + j(z).selectedChunklet?.name : Gt.value === "click" ? "Click to place " + j(z).selectedChunklet?.name : "Click to insert " + j(z).selectedChunklet?.name) + " ", 1), r[17] ||= s("span", { class: "sp-chunklet-hint-esc" }, "ESC to cancel", -1)]), $t.value ? (S(), o("div", {
						key: 0,
						class: "sp-chunklet-preview",
						style: v(en.value)
					}, null, 4)) : a("", !0)], 34)) : a("", !0),
					j(z).dragging ? (S(), o("button", {
						key: 1,
						class: "sp-edit-quit-btn",
						title: "Quit edit mode (save and exit)",
						onClick: r[1] ||= F((e) => j(fn)(), ["stop"])
					}, " quit edit mode ")) : a("", !0),
					j(z).dragging && j(Z) !== "idle" ? (S(), o("div", {
						key: 2,
						class: g(["sp-save-chip", "sp-save-" + j(Z)]),
						role: "status"
					}, [j(Z) === "saving" ? (S(), o("span", Ur)) : a("", !0), j(Z) === "saving" ? (S(), o(e, { key: 1 }, [l("saving…")], 64)) : j(Z) === "saved" ? (S(), o(e, { key: 2 }, [l("saved")], 64)) : j(Z) === "error" ? (S(), o(e, { key: 3 }, [l("save failed")], 64)) : a("", !0)], 2)) : a("", !0)
				], 4)], 4), [[te, !st.value]]),
				s("nav", { class: g(["sp-nav", { locked: j(Y).navLocked }]) }, [s("div", Wr, [
					s("button", {
						class: g(["sp-nav-btn sp-nav-lock", { locked: j(Y).navLocked }]),
						title: j(Y).navLocked ? "Unlock nav" : "Lock nav visible",
						onClick: r[2] ||= (e) => j(Y).navLocked = !j(Y).navLocked
					}, [...r[18] ||= [s("svg", {
						width: "14",
						height: "14",
						viewBox: "0 0 14 14",
						fill: "none"
					}, [s("rect", {
						x: "3",
						y: "5",
						width: "8",
						height: "7",
						rx: "1",
						stroke: "currentColor",
						"stroke-width": "1.2",
						fill: "none"
					}), s("path", {
						d: "M4.5 5V3.5a2.5 2.5 0 0 1 5 0V5",
						stroke: "currentColor",
						"stroke-width": "1.2",
						fill: "none"
					})], -1)]], 10, Gr),
					s("button", {
						class: "sp-nav-btn",
						disabled: Re.value && j(R),
						"aria-label": "Previous",
						onClick: qe
					}, [...r[19] ||= [s("svg", {
						width: "20",
						height: "20",
						viewBox: "0 0 20 20",
						fill: "none"
					}, [s("path", {
						d: "M12 4l-6 6 6 6",
						stroke: "currentColor",
						"stroke-width": "2",
						"stroke-linecap": "round"
					})], -1)]], 8, Kr),
					s("span", {
						class: "sp-nav-counter",
						onClick: yt
					}, A(j(m) + 1) + " / " + A(Ue.value), 1),
					s("button", {
						class: "sp-nav-btn",
						disabled: ze.value && j(ae),
						"aria-label": "Next",
						onClick: Ke
					}, [...r[20] ||= [s("svg", {
						width: "20",
						height: "20",
						viewBox: "0 0 20 20",
						fill: "none"
					}, [s("path", {
						d: "M8 4l6 6-6 6",
						stroke: "currentColor",
						"stroke-width": "2",
						"stroke-linecap": "round"
					})], -1)]], 8, qr),
					s("button", {
						class: "sp-nav-btn sp-fullscreen-btn",
						"aria-label": "Toggle fullscreen",
						title: "Fullscreen (F)",
						onClick: tt
					}, [...r[21] ||= [s("svg", {
						width: "16",
						height: "16",
						viewBox: "0 0 16 16",
						fill: "none"
					}, [s("path", {
						d: "M3 3h3M3 13h3M13 3h-3M13 13h-3",
						stroke: "currentColor",
						"stroke-width": "1.5",
						"stroke-linecap": "round"
					}), s("path", {
						d: "M3 6v4M13 6v4",
						stroke: "currentColor",
						"stroke-width": "1.5",
						"stroke-linecap": "round"
					})], -1)]]),
					s("button", {
						class: g(["sp-nav-btn", { active: j(he) }]),
						"aria-label": "Toggle presenter",
						title: "Presenter (P)",
						onClick: nt
					}, [...r[22] ||= [s("svg", {
						width: "16",
						height: "16",
						viewBox: "0 0 16 16",
						fill: "none"
					}, [
						s("rect", {
							x: "2",
							y: "3",
							width: "12",
							height: "10",
							rx: "1",
							stroke: "currentColor",
							"stroke-width": "1.3",
							fill: "none"
						}),
						s("rect", {
							x: "5",
							y: "6",
							width: "6",
							height: "4",
							rx: ".5",
							stroke: "currentColor",
							"stroke-width": "1",
							fill: "none"
						}),
						s("path", {
							d: "M6 13v1h4v-1",
							stroke: "currentColor",
							"stroke-width": "1.3",
							fill: "none"
						})
					], -1)]], 2),
					s("div", {
						class: "sp-nav-more",
						ref_key: "moreMenuEl",
						ref: lt
					}, [s("button", {
						class: g(["sp-nav-btn sp-nav-more-btn", { active: ct.value }]),
						"aria-label": "More options",
						title: "More…",
						onClick: r[3] ||= (e) => ct.value = !ct.value
					}, "⋯", 2), ct.value ? (S(), o("div", Jr, [
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[4] ||= (e) => {
								dt(), ct.value = !1;
							}
						}, [s("span", Yr, A(pt.value), 1), l(" " + A(ft.value), 1)]),
						r[30] ||= s("div", { class: "sp-nav-more-divider" }, null, -1),
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[5] ||= (e) => {
								Ut(), ct.value = !1;
							}
						}, [...r[23] ||= [s("span", { class: "sp-nav-more-icon" }, "◇", -1), l(" Dev tools ", -1)]]),
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[6] ||= (e) => {
								at.value = !at.value, ct.value = !1;
							}
						}, [...r[24] ||= [s("span", { class: "sp-nav-more-icon" }, "⊞", -1), l(" Overview ", -1)]]),
						s("button", {
							class: g(["sp-nav-more-item", { active: j(z).showChunkletsBar }]),
							onClick: r[7] ||= (e) => {
								Yt(), ct.value = !1;
							}
						}, [...r[25] ||= [s("span", { class: "sp-nav-more-icon" }, "▤", -1), l(" Chunks ", -1)]], 2),
						r[31] ||= s("div", { class: "sp-nav-more-divider" }, null, -1),
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[8] ||= (e) => jt()
						}, [s("span", { class: g(["sp-nav-more-icon sp-nav-more-icon-blackout", { active: X.value }]) }, "●", 2), r[26] ||= l(" Blackout ", -1)]),
						s("div", Xr, [
							s("button", {
								class: "sp-nav-more-browse-btn",
								title: "End of previous slide (A)",
								onClick: r[9] ||= (e) => Vt()
							}, [...r[27] ||= [s("svg", {
								width: "16",
								height: "16",
								viewBox: "0 0 16 16",
								fill: "none"
							}, [s("path", {
								d: "M10 3L5 8l5 5",
								stroke: "currentColor",
								"stroke-width": "1.5",
								"stroke-linecap": "round"
							}), s("path", {
								d: "M4 3v10",
								stroke: "currentColor",
								"stroke-width": "1.5",
								"stroke-linecap": "round"
							})], -1)]]),
							r[29] ||= l(" | ", -1),
							s("button", {
								class: "sp-nav-more-browse-btn",
								title: "End of next slide (Z)",
								onClick: r[10] ||= (e) => Ht()
							}, [...r[28] ||= [s("svg", {
								width: "16",
								height: "16",
								viewBox: "0 0 16 16",
								fill: "none"
							}, [s("path", {
								d: "M6 13l5-5-5-5",
								stroke: "currentColor",
								"stroke-width": "1.5",
								"stroke-linecap": "round"
							}), s("path", {
								d: "M12 13V3",
								stroke: "currentColor",
								"stroke-width": "1.5",
								"stroke-linecap": "round"
							})], -1)]])
						])
					])) : a("", !0)], 512)
				]), s("div", Zr, [(S(!0), o(e, null, E(Ve.value, (t) => (S(), o(e, { key: t.type === "pill" ? "p" + t.index : t.id }, [t.type === "ellipsis" ? (S(), o("span", Qr, "…")) : (S(), o("button", {
					key: 1,
					class: g(["sp-nav-pill", {
						active: t.index === j(m),
						"sp-nav-pill-h1": gt.value[t.index] === 1,
						"sp-nav-pill-h2": gt.value[t.index] === 2,
						"sp-nav-pill-h3": gt.value[t.index] === 3
					}]),
					onClick: (e) => {
						j(M)(t.index), I.value = 0;
					},
					"aria-label": "Go to slide " + (t.index + 1)
				}, null, 10, $r))], 64))), 128))])], 2),
				j(z).showChunkletsBar && j(z).chunkletDefs.length ? (S(), o("div", ei, [(S(!0), o(e, null, E(j(z).chunkletDefs, (e) => (S(), o("button", {
					key: e.name,
					class: g(["sp-chunklets-bar-btn", { active: j(z).selectedChunklet === e }]),
					onClick: (t) => Jt(e)
				}, [l(A(e.name) + " ", 1), s("span", ni, A(j(Nt)(e)), 1)], 10, ti))), 128)), s("button", {
					class: "sp-chunklets-bar-btn",
					onClick: r[11] ||= (e) => j(z).showChunkletsBar = !j(z).showChunkletsBar
				}, "×")])) : a("", !0),
				s("div", ri, [s("div", {
					class: "sp-progress-bar",
					style: v({ width: Be.value + "%" })
				}, null, 4)]),
				X.value ? (S(), o("div", {
					key: 2,
					class: "sp-main-blackout",
					onClick: r[12] ||= (e) => X.value = !1
				}, [...r[32] ||= [s("span", { class: "sp-main-blackout-hint" }, "click to dismiss", -1)]])) : a("", !0)
			], 64)) : d.value == "presenter" ? (S(), i(fr, {
				key: 3,
				current: j(_),
				currentIndex: j(m),
				total: j(w),
				activeHtml: Ge.value,
				progressPercent: Be.value,
				blackout: X.value,
				exitBlackout: Ft,
				components: c.components,
				designWidth: c.designWidth,
				designHeight: c.designHeight,
				config: j(Y),
				slides: j(p)
			}, null, 8, [
				"current",
				"currentIndex",
				"total",
				"activeHtml",
				"progressPercent",
				"blackout",
				"components",
				"designWidth",
				"designHeight",
				"config",
				"slides"
			])) : d.value == "print-slides" || d.value == "print-steps" ? (S(), i(mr, {
				key: 4,
				steps: d.value == "print-steps",
				components: c.components,
				designWidth: c.designWidth,
				designHeight: c.designHeight,
				config: j(Y),
				slides: j(p),
				currentIndex: j(m),
				stepIndex: j(I)
			}, null, 8, [
				"steps",
				"components",
				"designWidth",
				"designHeight",
				"config",
				"slides",
				"currentIndex",
				"stepIndex"
			])) : a("", !0),
			at.value ? (S(), i(yr, {
				key: 5,
				slides: j(p),
				currentIndex: j(m),
				slideHeadingLevels: gt.value,
				overviewThumbStyle: mt.value,
				overviewSlideStyle: ht.value,
				components: c.components,
				onClose: r[13] ||= (e) => at.value = !1,
				onSelect: _t
			}, null, 8, [
				"slides",
				"currentIndex",
				"slideHeadingLevels",
				"overviewThumbStyle",
				"overviewSlideStyle",
				"components"
			])) : a("", !0),
			u(Qn, {
				visible: ot.value,
				"export-fn": j(z).export,
				onClose: r[14] ||= (e) => ot.value = !1
			}, null, 8, ["visible", "export-fn"]),
			vt.value ? (S(), i(kr, {
				key: 6,
				slides: j(p),
				designWidth: c.designWidth,
				designHeight: c.designHeight,
				components: c.components,
				total: j(w),
				onClose: Ct,
				onSelect: wt
			}, null, 8, [
				"slides",
				"designWidth",
				"designHeight",
				"components",
				"total"
			])) : a("", !0),
			c.raw?.after ? (S(), i(O(fe.value), { key: 7 })) : a("", !0)
		], 6));
	}
}), ai = /* @__PURE__ */ f({
	__name: "SpAlternatives",
	props: {
		at: { default: 0 },
		cycle: {
			type: Boolean,
			default: !1
		}
	},
	setup(t) {
		let r = t, a = T(null), c = p("stepIndex") ?? { value: 0 }, l = M();
		function u() {
			let e = a.value?.closest(".sp-slide")?.querySelector("[data-fixed-step]")?.getAttribute("data-fixed-step");
			return e == null ? c.value : parseInt(e);
		}
		let d = n(() => (l.default?.() ?? []).filter((e) => typeof e.type == "string")), f = n(() => {
			if (d.value.length === 0) return -1;
			let e = u() - (typeof r.at == "string" ? parseInt(r.at, 10) : r.at);
			return e < 0 ? -1 : !r.cycle && e >= d.value.length ? d.value.length - 1 : e % d.value.length;
		});
		return (t, n) => (S(), o(e, null, [s("span", {
			ref_key: "ghostEl",
			ref: a,
			style: { display: "none" }
		}, null, 512), (S(!0), o(e, null, E(d.value, (e, t) => (S(), i(O(e), {
			key: t,
			class: g(t === f.value ? "sp-anim-shown" : "sp-anim-hidden sp-hidden-is-empty")
		}, null, 8, ["class"]))), 128))], 64));
	}
}), oi = /* @__PURE__ */ f({
	__name: "SpAnim",
	props: {
		spec: {},
		at: { default: "+0" },
		noJump: {
			type: [Boolean, String],
			default: !1
		}
	},
	setup(e) {
		let t = e, r = p("stepIndex"), i = p("animInstances"), a = T(null);
		function s() {
			if (!a) return r.value;
			let e = m().querySelector("[data-fixed-step]")?.getAttribute("data-fixed-step");
			return e == null ? r.value : parseInt(e);
		}
		function c(e) {
			let t = e.match(/^(\d+(?:\.\d+)?)(ms|s)\s+(.+)$/);
			if (t) {
				let e = parseFloat(t[1]) * (t[2] === "s" ? 1e3 : 1), n = t[3], r = c(n);
				for (let t of r) t.delayedBy = e;
				return r;
			}
			let n = e.match(/^@(\w+)(?:\((.*)\))?$/);
			if (n) {
				let e = he(n[1]);
				if (e) return e.parse(n[2] ?? "");
			}
			return e.startsWith("-") ? [{
				type: "hide",
				selector: e.slice(1)
			}] : [{
				type: "show",
				selector: e
			}];
		}
		function l(e) {
			let t = [], n = e.split("^").map((e) => e.trim());
			for (let e of n) t.push(...c(e));
			return t;
		}
		let u = n(() => (t.spec || "").split("|"));
		function d() {
			let e = t.at || "+0";
			if (e.startsWith("+") || e.startsWith("-")) throw Error("Relative at offset not supported in SpAnim, absolute at should be produced by useSteps");
			return parseInt(e, 10);
		}
		let f = n(() => {
			if (!t.spec) return [];
			let e = [];
			for (let t of u.value) {
				let n = t.trim(), r = n.match(/^@(\w+)\((.+)\)$/);
				if (r) {
					let t = he(r[1]);
					if (t?.expand) {
						let n = t.expand(r[2], m());
						for (let t of n) e.push(t);
						continue;
					}
				}
				e.push(l(n));
			}
			return e;
		});
		function m() {
			let e = a.value;
			if (!e) throw "not yet";
			for (; !e.classList.contains("sp-slide");) if (e = e.parentElement, e === null) throw "should not happen: .sp-anim-ghost has no .sp-slide ancestor";
			return e;
		}
		let h = -1, g = /* @__PURE__ */ new Map();
		function _() {
			for (let e of g.values()) for (let t of e) clearTimeout(t);
			g.clear();
		}
		function v(e, t = !1) {
			let n = d(), r = f.value[e - n - 1];
			if (!r) return;
			let i = m(), a = [...r].sort((e, t) => (e.delayedBy ?? 0) - (t.delayedBy ?? 0));
			for (let n of a) {
				let r = z._animActionTypes[n.type];
				if (r) if (n.delayedBy && !t) {
					let a = setTimeout(() => {
						try {
							r.apply(i, n, t);
						} catch (t) {
							console.error("(Caught) Error applying anim action:", t), Se(`Error applying anim action at step ${e}: ${t}`);
						}
					}, n.delayedBy), o = g.get(e) ?? [];
					o.push(a), g.set(e, o);
				} else try {
					r.apply(i, n, t);
				} catch (t) {
					console.error("(Caught) Error applying anim action:", t), Se(`Error applying anim action at step ${e}: ${t}`);
				}
			}
		}
		function x(e) {
			let t = [];
			for (let e of f.value) t.push(...e);
			for (let n of t.reverse()) try {
				z._animActionTypes[n.type]?.init?.(e, n);
			} catch (e) {
				console.error("(Caught) Error initializing anim action:", e), Se(`Error initializing anim action: ${e}`);
			}
		}
		function C(e, t) {
			let n = m();
			_(), x(n);
			for (let n = 1; n <= e; n++) v(n, t);
		}
		function w(e, t) {
			if (e !== h) {
				if (e > h) for (let n = h + 1; n <= e; n++) v(n, t || n < e);
				else C(e, !0);
				h = e;
			}
		}
		function E(e = !0) {
			let t = s();
			C(t, e), h = t;
		}
		return y(() => {
			let e = {
				syncToStep: w,
				refresh: E
			};
			i.add(e), E(), b(() => {
				_(), i.delete(e);
			});
		}), (e, t) => (S(), o("span", {
			class: "sp-anim-ghost",
			ref_key: "animEl",
			ref: a
		}, null, 512));
	}
}), si = ["data-debug"], ci = {
	key: 0,
	class: "sp-drag-edit-overlay"
}, li = ["onMousedown", "onTouchstart"], ui = .25, di = /*@__PURE__*/ f({
	__name: "SpDrag",
	props: {
		rbox: { default: "" },
		x: { default: 0 },
		y: { default: 0 },
		w: { default: "auto" },
		h: { default: "auto" },
		rotate: { default: 0 },
		editableIndex: { default: -1 }
	},
	setup(t) {
		let r = p("slideIndex", T(0)), i = t, c = n(() => {
			if (!i.rbox) return null;
			let e = i.rbox.split("|");
			return e.length < 5 ? null : {
				x: parseFloat(e[0]),
				y: parseFloat(e[1]),
				w: (/^\d+\.?\d*$/.test(e[2]), e[2]),
				h: (/^\d+\.?\d*$/.test(e[3]), e[3]),
				rotate: parseFloat(e[4])
			};
		}), l = T(null), u = T(!1), d = [
			"nw",
			"n",
			"ne",
			"e",
			"se",
			"s",
			"sw",
			"w"
		], f = T(0), m = T(0), h = T("auto"), _ = T("auto"), x = T(0);
		function C(e) {
			if (typeof e == "number") return e;
			let t = parseFloat(e);
			return isNaN(t) ? 0 : t;
		}
		function w() {
			let e = document.querySelector(".sp-scale-wrap");
			if (!e) return 1;
			let t = window.getComputedStyle(e).transform;
			if (!t || t === "none") return 1;
			let n = t.match(/matrix\(([^)]+)\)/);
			if (n) return parseFloat(n[1].split(", ")[0]) || 1;
			let r = t.match(/matrix3d\(([^)]+)\)/);
			return r && parseFloat(r[1].split(", ")[0]) || 1;
		}
		function O() {
			let e = l.value?.closest("#sp-presentation"), t = e ? getComputedStyle(e) : null, n = parseFloat(t?.getPropertyValue("--sp-design-width") ?? ""), r = parseFloat(t?.getPropertyValue("--sp-design-height") ?? "");
			return {
				width: Number.isFinite(n) ? n : 1920,
				height: Number.isFinite(r) ? r : 1080
			};
		}
		function k() {
			let { width: e, height: t } = O();
			return {
				x: e * ui,
				y: t * ui,
				w: e * (1 - 2 * ui),
				h: t * (1 - 2 * ui),
				rotate: 0
			};
		}
		function A(e) {
			let t = Sn(i.editableIndex);
			if (t) return t[e];
			let n = c.value;
			return n ? n[e] : i.rbox ? i[e] : k()[e];
		}
		function j() {
			f.value = C(A("x")), m.value = C(A("y")), h.value = A("w"), _.value = A("h"), x.value = C(A("rotate")), M = P(!0);
		}
		let M = "";
		function ee(e) {
			if (!u.value) return;
			let t = e.shiftKey ? 10 : 1;
			switch (e.key) {
				case "ArrowUp":
					e.preventDefault(), m.value -= t;
					break;
				case "ArrowDown":
					e.preventDefault(), m.value += t;
					break;
				case "ArrowLeft":
					e.preventDefault(), f.value -= t;
					break;
				case "ArrowRight":
					e.preventDefault(), f.value += t;
					break;
			}
		}
		function te() {
			P(!0) !== M && j(), l.value && (h.value === "auto" && (h.value = l.value.offsetWidth || 200), _.value === "auto" && (_.value = l.value.offsetHeight || 100)), u.value = !0, window.addEventListener("keydown", ee);
		}
		function N() {
			u.value = !1, window.removeEventListener("keydown", ee), q.value && dn(q.value);
		}
		function ne(e = !1) {
			let t = P(), n = P(!0);
			if (n === t) {
				e || N();
				return;
			}
			Lt();
			let a = !!i.rbox || bn(i.editableIndex) != null, o = l.value?.getAttribute("data-drag-id"), s = l.value?.getAttribute("data-source-line"), c = l.value?.getAttribute("data-source-file") || rt(l.value);
			fetch("/__sp_edit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					oldAttrs: a ? n : "__sp_insert__",
					newAttrs: t,
					file: c,
					sourceLine: s ? parseInt(s, 10) : null,
					editableIndex: i.editableIndex,
					slide: r.value,
					dragId: o
				})
			}).then(async (e) => {
				let n = {};
				try {
					n = await e.json();
				} catch {}
				!e.ok || !n.ok ? (console.error("SP edit failed:", e.status, n), zt(), ie(t)) : yn(i.editableIndex, t.replace(/^rbox="|"$/g, ""));
			}).catch((e) => {
				console.error("SP edit error:", e), zt(), ie(t);
			}).finally(() => {
				e || N();
			});
		}
		function re() {
			z.devServer && P(!0) !== P() && ne(!0);
		}
		function P(e = !1) {
			return `rbox="${e ? A("x") : Math.round(f.value)}|${e ? A("y") : Math.round(m.value)}|${e ? A("w") : typeof h.value == "number" ? L(h.value) : h.value}|${e ? A("h") : typeof _.value == "number" ? L(_.value) : _.value}|${e ? A("rotate") : Math.round(x.value * 10) / 10}"`;
		}
		function ie(e) {
			navigator.clipboard?.writeText(e).catch(() => {}), alert(`Could not auto-save to source.\n\nCopy this attribute and replace the existing sp-drag rbox attribute manually:\n\n${e}`);
		}
		let I = (e) => typeof e == "number" || /^\d+(\.\d+)?$/.test(e) ? e + "px" : e, L = (e) => Math.round(e), R = (e) => Math.round(e / 20) * 20, ae = {
			e: ["w"],
			s: ["h"],
			w: ["x", "w"],
			n: ["y", "h"],
			ne: [
				"y",
				"h",
				"w"
			],
			nw: [
				"x",
				"y",
				"w",
				"h"
			],
			se: ["w", "h"],
			sw: [
				"x",
				"w",
				"h"
			]
		}, oe = n(() => ({
			position: "absolute",
			left: I(f.value),
			top: I(m.value),
			width: I(h.value),
			height: I(_.value),
			transform: x.value ? `rotate(${x.value}deg)` : void 0
		})), se = !1, ce = 0, le = 0, ue = 0, B = 0;
		function V(e) {
			return "touches" in e ? {
				clientX: e.touches[0].clientX,
				clientY: e.touches[0].clientY
			} : {
				clientX: e.clientX,
				clientY: e.clientY
			};
		}
		let H = 0;
		function de(e) {
			if (e.preventDefault(), ln() && !u.value && q.value && (un(q.value), nn()), u.value) {
				me(e);
				return;
			}
			let t = Date.now();
			if (t - H < 300) {
				q.value && un(q.value), H = 0;
				return;
			}
			H = t;
		}
		function fe(e) {
			e.preventDefault(), ln() && !u.value && q.value && (un(q.value), nn()), u.value && me(e);
		}
		function pe() {
			se && (se = !1, document.removeEventListener("mousemove", he), document.removeEventListener("mouseup", pe), document.removeEventListener("touchmove", he), document.removeEventListener("touchend", pe), Yt(), re());
		}
		function me(e) {
			je(), Jt(), se = !0;
			let { clientX: t, clientY: n } = V(e);
			ce = t, le = n, ue = f.value, B = m.value, document.addEventListener("mousemove", he), document.addEventListener("mouseup", pe), document.addEventListener("touchmove", he, { passive: !1 }), document.addEventListener("touchend", pe);
		}
		function he(e) {
			if (!se) return;
			e.preventDefault();
			let t = w(), { clientX: n, clientY: r } = V(e), i = (n - ce) / t, a = (r - le) / t;
			f.value = L(ue + i), m.value = L(B + a);
		}
		let ge = !1, _e = "", ve = 0, ye = 0, be = 0, U = 0, xe = 0, W = 0;
		function Se() {
			ge && (ge = !1, document.removeEventListener("mousemove", we), document.removeEventListener("mouseup", Se), document.removeEventListener("touchmove", we), document.removeEventListener("touchend", Se), Yt(), re());
		}
		function Ce(e, t) {
			if (!u.value) return;
			je(), Jt(), ge = !0;
			let { clientX: n, clientY: r } = V(e);
			_e = t, ve = n, ye = r, be = f.value, U = m.value, xe = C(h.value), W = C(_.value), document.addEventListener("mousemove", we), document.addEventListener("mouseup", Se), document.addEventListener("touchmove", we, { passive: !1 }), document.addEventListener("touchend", Se);
		}
		function we(e) {
			if (!ge) return;
			e.preventDefault();
			let t = w(), { clientX: n, clientY: r } = V(e), i = (n - ve) / t, a = (r - ye) / t, o = be, s = U, c = xe, l = W;
			switch (_e) {
				case "n":
					s = U + a, l = W - a;
					break;
				case "s":
					l = W + a;
					break;
				case "e":
					c = xe + i;
					break;
				case "w":
					o = be + i, c = xe - i;
					break;
				case "ne":
					s = U + a, l = W - a, c = xe + i;
					break;
				case "nw":
					o = be + i, s = U + a, c = xe - i, l = W - a;
					break;
				case "se":
					c = xe + i, l = W + a;
					break;
				case "sw":
					o = be + i, c = xe - i, l = W + a;
					break;
			}
			if (c < 10 && (c = 10), l < 10 && (l = 10), e.shiftKey) for (let e of ae[_e]) e === "x" ? o = R(o) : e === "y" ? s = R(s) : e === "w" ? c = R(c) : l = R(l);
			f.value = L(o), m.value = L(s), h.value = L(c), _.value = L(l);
		}
		let G = !1, Te = 0, K = 0, Ee = 0, De = 0;
		function Oe() {
			G && (G = !1, document.removeEventListener("mousemove", Ae), document.removeEventListener("mouseup", Oe), document.removeEventListener("touchmove", Ae), document.removeEventListener("touchend", Oe), Yt(), re());
		}
		function ke(e) {
			if (!u.value) return;
			je(), Jt(), G = !0;
			let t = l.value.getBoundingClientRect(), { clientX: n, clientY: r } = V(e);
			Te = t.left + t.width / 2, K = t.top + t.height / 2, Ee = Math.atan2(r - K, n - Te), De = x.value, document.addEventListener("mousemove", Ae), document.addEventListener("mouseup", Oe), document.addEventListener("touchmove", Ae, { passive: !1 }), document.addEventListener("touchend", Oe);
		}
		function Ae(e) {
			if (!G) return;
			e.preventDefault();
			let { clientX: t, clientY: n } = V(e), r = Math.atan2(n - K, t - Te) - Ee, i = De + 180 / Math.PI * r;
			e.shiftKey && (i = Math.round(i / 15) * 15), x.value = Math.round(i * 10) / 10;
		}
		function je() {
			pe(), Se(), Oe();
		}
		j();
		let q = T(null);
		return y(() => {
			l.value && (q.value = {
				el: l.value,
				index: i.editableIndex,
				slide: r.value,
				begin: te,
				saveAndEnd: ne
			}, on(q.value), !i.rbox && bn(i.editableIndex) == null && j(), mn(q.value));
		}), b(() => {
			u.value && P(!0) !== P() && ne(), q.value && sn(q.value.el);
		}), (n, r) => (S(), o("div", {
			ref_key: "el",
			ref: l,
			class: g(["sp-drag", { "sp-drag-editing": u.value }]),
			style: v(oe.value),
			onMousedown: fe,
			onTouchstart: de,
			"data-debug": t.editableIndex
		}, [s("div", { class: g(["sp-drag-content", { "sp-drag-content-blocked": u.value }]) }, [D(n.$slots, "default", {}, void 0, !0)], 2), u.value ? (S(), o("div", ci, [
			r[0] ||= s("div", { class: "sp-drag-edit-border" }, null, -1),
			(S(), o(e, null, E(d, (e) => s("div", {
				key: e,
				class: g(["sp-drag-handle", "sp-handle-" + e]),
				onMousedown: F((t) => Ce(t, e), ["stop"]),
				onTouchstart: F((t) => Ce(t, e), ["stop", "prevent"])
			}, null, 42, li)), 64)),
			r[1] ||= s("div", { class: "sp-drag-rotate-line" }, null, -1),
			s("div", {
				class: "sp-drag-rotate-handle",
				onMousedown: F(ke, ["stop"]),
				onTouchstart: F(ke, ["stop", "prevent"])
			}, null, 32)
		])) : a("", !0)], 46, si));
	}
}), fi = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, pi = /*#__PURE__*/ fi(di, [["__scopeId", "data-v-89d71127"]]), mi = ["src", "alt"], hi = {
	key: 1,
	class: "sp-img-loading"
}, gi = /*#__PURE__*/ fi(/* @__PURE__ */ f({
	__name: "SpImg",
	props: {
		src: {},
		alt: { default: "" }
	},
	setup(e) {
		let t = e, n = T("");
		async function r() {
			let e = t.src;
			if (!e) {
				n.value = "";
				return;
			}
			if (e.startsWith("data:") || e.startsWith("blob:")) {
				n.value = e;
				return;
			}
			if (e.match(/\.svg(\?|#|$)/i)) {
				let t = We(e);
				if (t.value) {
					n.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(t.value)}`;
					return;
				}
				try {
					if (await Ke(e), t.value) {
						n.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(t.value)}`;
						return;
					}
				} catch {}
				n.value = e;
				return;
			}
			let r = Ge(e);
			if (r.value) {
				n.value = r.value;
				return;
			}
			try {
				if (await qe(e), r.value) {
					n.value = r.value;
					return;
				}
			} catch {}
			n.value = e;
		}
		return N(() => t.src, r, { immediate: !0 }), (t, r) => n.value ? (S(), o("img", {
			key: 0,
			src: n.value,
			alt: e.alt,
			class: g(t.$attrs.class),
			style: v(t.$attrs.style)
		}, null, 14, mi)) : (S(), o("span", hi, "…"));
	}
}), [["__scopeId", "data-v-9678aed9"]]), _i = /* @__PURE__ */ f({
	__name: "SpStep",
	props: {
		from: {},
		to: {},
		until: {},
		only: {},
		hide: { type: Boolean },
		animation: {}
	},
	setup(e) {
		let t = e, n = M();
		return y(() => {
			h(() => {
				let e = n.default?.() ?? [];
				for (let n of e) if (typeof n == "object" && n.el && n.el.nodeType === 1) {
					let e = n.el;
					if (t.from !== void 0 && e.setAttribute("data-sp-step-from", String(t.from)), t.to !== void 0 && e.setAttribute("data-sp-step-to", String(t.to)), t.until !== void 0) {
						let n = typeof t.until == "string" ? parseInt(t.until, 10) : t.until;
						e.setAttribute("data-sp-step-to", String(n - 1));
					}
					if (t.only !== void 0) {
						let n = typeof t.only == "string" ? parseInt(t.only, 10) : t.only;
						e.setAttribute("data-sp-step-from", String(n)), e.setAttribute("data-sp-step-to", String(n));
					}
					t.hide && e.setAttribute("data-sp-step-hide", ""), t.animation && e.setAttribute("data-sp-step-animation", t.animation);
					break;
				}
			});
		}), (e, t) => D(e.$slots, "default");
	}
}), vi = /* @__PURE__ */ f({
	__name: "SpStyle",
	props: { css: { default: "" } },
	setup(e) {
		let t = e, n = p("slideNum", void 0), r = M(), i = T(null);
		function a() {
			return t.css ? t.css : (r.default?.() ?? []).map((e) => {
				let t = e.children;
				return typeof t == "string" ? t : Array.isArray(t) ? t.map((e) => typeof e == "string" ? e : "").join("") : "";
			}).join("");
		}
		function o(e) {
			let t = n?.value;
			return t === void 0 ? e : `.sp-slide-${t} { ${e} }`;
		}
		return y(() => {
			let e = a();
			if (!e) return;
			let t = document.createElement("style");
			t.textContent = o(e), document.head.appendChild(t), i.value = t;
		}), b(() => {
			i.value?.remove();
		}), (e, t) => null;
	}
});
//#endregion
//#region src/composables/useSlideTree.ts
function yi(e) {
	return { tree: n(() => {
		let t = [];
		for (let n = 0; n < e.value.length; n++) {
			let r = e.value[n];
			if (r.noToc) continue;
			let i = document.createElement("div");
			i.innerHTML = r.html, i.querySelectorAll("h1,h2,h3").forEach((e) => {
				let i = e.textContent?.trim();
				i && t.push({
					slideIndex: n,
					slideNum: r.num,
					level: parseInt(e.tagName[1], 10),
					text: i
				});
			});
		}
		return t;
	}) };
}
//#endregion
//#region src/components/SpToc.vue?vue&type=script&setup=true&lang.ts
var bi = {
	key: 0,
	class: "sp-toc"
}, xi = {
	key: 0,
	class: "sp-toc-section"
}, Si = ["onClick"], Ci = { class: "sp-toc-text" }, wi = /* @__PURE__ */ f({
	__name: "SpToc",
	props: {
		start: { default: 2 },
		end: { default: 999 },
		highlight: { default: 0 },
		context: {
			type: Boolean,
			default: !1
		}
	},
	setup(t) {
		let r = t, i = (e) => {
			let t = typeof e == "string" ? parseInt(e, 10) : e;
			if (isNaN(t)) throw Error(`Invalid number: ${e}`);
			return t;
		}, c = p("slides"), l = p("slideIndex"), u = p("goTo"), { tree: d } = yi(n(() => c.value)), f = n(() => l.value + i(r.highlight)), m = n(() => {
			let e = d.value, t = e.filter((e) => e.level >= i(r.start) && e.level <= i(r.end));
			if (i(r.start) > 1) {
				let n = i(r.start) - 1, a = f.value, o = e.slice().reverse().find((e) => e.level === n && e.slideIndex <= a);
				if (!o) console.warn(`[sp-toc] no h${n} before slide ${a + 1}, showing all`);
				else {
					let n = e.filter((e) => e.level < i(r.start)), a = n.indexOf(o), s = o.slideIndex, c = a + 1 < n.length ? n[a + 1].slideIndex : Infinity;
					t = t.filter((e) => e.slideIndex >= s && e.slideIndex < c);
				}
			}
			return t;
		}), h = n(() => {
			if (i(r.start) <= 1) return null;
			let e = d.value, t = i(r.start) - 1, n = f.value;
			return e.slice().reverse().find((e) => e.level === t && e.slideIndex <= n) ?? null;
		});
		return (t, n) => m.value.length ? (S(), o("nav", bi, [D(t.$slots, "default", {
			items: m.value,
			currentIndex: j(l).value,
			goTo: j(u),
			activeSection: h.value
		}, () => [r.context && h.value ? (S(), o("div", xi, A(h.value.text), 1)) : a("", !0), s("ol", null, [(S(!0), o(e, null, E(m.value, (e) => (S(), o("li", {
			key: e.slideIndex,
			class: g(["sp-toc-h" + e.level, { "sp-toc-active": e.slideIndex === f.value }]),
			onClick: (t) => j(u)(e.slideIndex)
		}, [s("span", Ci, A(e.text), 1)], 10, Si))), 128))])])])) : a("", !0);
	}
}), Ti = 1, Ei = {
	"": 1,
	px: 1,
	cm: 96 / 2.54,
	mm: 96 / 10 / 2.54,
	Q: 96 / 40 / 2.54,
	in: 96,
	pc: 96 / 6,
	pt: 96 / 72
};
function Di(e) {
	if (!e) return 0;
	let t = e.match(/^([\d.]+)(\w*)$/);
	return t ? parseFloat(t[1]) * (Ei[t[2]] ?? 1) : 0;
}
var Oi = (e) => {
	let t = e.querySelector("svg");
	if (!t || t.getAttribute("viewBox")) return;
	let n = Di(t.getAttribute("width")), r = Di(t.getAttribute("height"));
	n && r && (t.setAttribute("viewBox", `0 0 ${n} ${r}`), t.removeAttribute("width"), t.removeAttribute("height"));
}, ki = (e) => {
	e.querySelectorAll("[*|href]:not([href])").forEach((e) => {
		let t = e.getAttributeNS("http://www.w3.org/1999/xlink", "href");
		t && (e.setAttribute("href", t), e.removeAttributeNS("http://www.w3.org/1999/xlink", "href"));
	});
}, Ai = (e) => {
	let t = {}, n = {};
	e.querySelectorAll("*").forEach((e) => {
		let r = e.id;
		r && (t[r] = e);
		for (let t of [
			"clip-path",
			"color-profile",
			"fill",
			"filter",
			"marker-start",
			"marker-mid",
			"marker-end",
			"mask",
			"stroke"
		]) {
			let r = e.getAttribute(t);
			if (!r) continue;
			let i = r.trim().match(/^url\(#(.+?)\)$/);
			i && (n[i[1]] ??= []).push({
				el: e,
				attr: t
			});
		}
		let i = e.getAttribute("href")?.trim();
		i?.startsWith("#") && (n[i.slice(1)] ??= []).push({
			el: e,
			attr: "href"
		});
	});
	for (let e in n) {
		let r = t[e];
		if (!r) continue;
		let i = `svgid-${Ti++}`;
		r.id = i;
		for (let { el: t, attr: r } of n[e]) {
			let n = t.getAttribute(r);
			t.setAttribute(r, n.replace("#" + e, "#" + i));
		}
	}
}, ji = (e) => {
	e.querySelectorAll("[style]").forEach((e) => {
		let t = e.getAttribute("style");
		t && (t.split(";").forEach((t) => {
			let n = t.trim();
			if (!n || n.startsWith("-")) return;
			let [r, ...i] = n.split(":").map((e) => e.trim());
			r && i.length && e.setAttribute(r, i.join(":"));
		}), e.removeAttribute("style"));
	});
}, Mi = [
	Oi,
	ki,
	Ai,
	ji
], Ni = /*#__PURE__*/ fi(/* @__PURE__ */ f({
	__name: "SpSvg",
	props: {
		src: {},
		path: { default: "svg" },
		wrap: {
			type: Boolean,
			default: !1
		},
		width: {},
		height: {}
	},
	setup(e) {
		let t = e, r = n(() => {
			let e = [...Mi];
			return t.width != null && e.push((e) => {
				let n = e.querySelector("svg");
				n && n.setAttribute("width", String(t.width));
			}), t.height != null && e.push((e) => {
				let n = e.querySelector("svg");
				n && n.setAttribute("height", String(t.height));
			}), e;
		});
		return (t, n) => e.wrap ? (S(), o("div", m({ key: 0 }, t.$attrs, { class: "sp-svg-wrap" }), [u(Hi, {
			src: e.src,
			path: e.path,
			transformers: r.value,
			"no-fix-void": "",
			"no-component": "",
			"no-wrap": ""
		}, null, 8, [
			"src",
			"path",
			"transformers"
		])], 16)) : (S(), i(Hi, m({ key: 1 }, t.$attrs, {
			src: e.src,
			path: e.path,
			transformers: r.value,
			"no-fix-void": "",
			"no-component": "",
			"no-wrap": ""
		}), null, 16, [
			"src",
			"path",
			"transformers"
		]));
	}
}), [["__scopeId", "data-v-b75d770e"]]), Pi = {
	key: 0,
	class: "sp-slide-source"
}, Fi = { class: "sp-slide-source-header" }, Ii = ["innerHTML"], Li = /*#__PURE__*/ fi(/* @__PURE__ */ f({
	__name: "SpSlideSource",
	props: {
		for: { default: void 0 },
		transform: {
			type: [Function, null],
			default: null
		}
	},
	setup(e) {
		let t = e, r = p("rawSlideSources"), i = p("slideIndex"), c = n(() => t.for === void 0 ? i.value : t.for), u = T(""), d = 0;
		return N([
			c,
			() => t.transform,
			r
		], async ([e]) => {
			let n = r.value[e];
			if (!n) {
				u.value = "";
				return;
			}
			let i = ++d, a = `<pre><code class="language-html">${(t.transform ? t.transform(n) : n).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
			try {
				let e = await Fr(a);
				i === d && (u.value = e);
			} catch {
				i === d && (u.value = a);
			}
		}, { immediate: !0 }), (e, t) => u.value ? (S(), o("div", Pi, [s("div", Fi, [D(e.$slots, "header", { forSlide: c.value }, () => [l(" Slide " + A(c.value + 1) + " source ", 1)], !0)]), s("div", {
			class: "sp-slide-source-body",
			innerHTML: u.value
		}, null, 8, Ii)])) : a("", !0);
	}
}), [["__scopeId", "data-v-8a380df0"]]), Ri = ["data-source-file-push"], zi = ["innerHTML"], Bi = /*@__PURE__*/ f({
	__name: "SpInclude",
	props: {
		src: {},
		path: { default: "" },
		transformers: { default: () => [] },
		noFixVoid: {
			type: Boolean,
			default: !1
		},
		noComponent: {
			type: Boolean,
			default: !1
		},
		noWrap: {
			type: Boolean,
			default: !1
		}
	},
	setup(t) {
		let n = p("contentVersion"), r = p("sp-components", {}), a = d(() => Promise.resolve().then(() => Vi)), c = t, l = T(""), u = T(""), g = k(null), v = T(null);
		b(() => {
			v.value && clearTimeout(v.value);
		});
		function y(e) {
			c.noFixVoid || (e = Ee(e)), e = De(e);
			let t = document.createElement("div");
			if (t.innerHTML = e, c.path) {
				let e = t.querySelector(c.path);
				if (!e) return "";
				t.innerHTML = "", t.appendChild(e.cloneNode(!0));
			}
			for (let e of c.transformers) e(t);
			return t.innerHTML;
		}
		function x(e) {
			if (!e) {
				g.value = null;
				return;
			}
			g.value = f({
				template: c.noWrap ? `${e}` : `<div class="sp-include">${e}</div>`,
				components: {
					"sp-alternatives": ai,
					"sp-anim": oi,
					"sp-drag": pi,
					"sp-img": gi,
					"sp-include": a,
					"sp-step": _i,
					"sp-style": vi,
					"sp-toc": wi,
					"sp-svg": Ni,
					"sp-slide-source": Li,
					...r
				}
			});
		}
		function C() {
			h(() => {
				n.value++;
			});
		}
		return N(We(c.src), async (e) => {
			if (e) v.value &&= (clearTimeout(v.value), null), l.value = "", u.value = y(e), c.noComponent || x(u.value), C();
			else if (e === void 0) {
				if (v.value) return;
				v.value = setTimeout(() => {
					g.value = null, v.value = null;
				}, 500);
				try {
					await Ke(c.src);
				} catch (e) {
					l.value = `${e.message} (src: ${c.src})`, v.value &&= (clearTimeout(v.value), null);
				}
			}
		}, { immediate: !0 }), (n, r) => (S(), o(e, null, [
			s("span", {
				style: { display: "none" },
				"data-source-file-push": t.src
			}, null, 8, Ri),
			l.value ? (S(), o("div", m({ key: 0 }, n.$attrs, { class: "sp-include-error" }), A(l.value), 17)) : c.noComponent ? (S(), o("div", m({ key: 1 }, n.$attrs, {
				class: "sp-include",
				innerHTML: u.value
			}), null, 16, zi)) : (S(), i(O(g.value), _(m({ key: 2 }, n.$attrs)), null, 16)),
			r[0] ||= s("span", {
				style: { display: "none" },
				"data-source-file-pop": ""
			}, null, -1)
		], 64));
	}
}), Vi = /* @__PURE__ */ I({ default: () => Hi }), Hi = /*#__PURE__*/ fi(Bi, [["__scopeId", "data-v-6d6e4e15"]]), Ui = { class: "sp-bib" }, Wi = /* @__PURE__ */ f({
	inheritAttrs: !1,
	__name: "SpBib",
	props: {
		src: {},
		path: {}
	},
	setup(e) {
		return (t, n) => (S(), o("div", Ui, [e.src ? (S(), i(Hi, m({
			key: 0,
			src: e.src,
			path: e.path
		}, t.$attrs), null, 16, ["src", "path"])) : D(t.$slots, "default", {}, void 0, void 0, 1)]));
	}
}), Gi = {
	BIB_SELECTOR: ".sp-bib",
	CITE_SELECTOR: "a[role=\"doc-biblioref\"], .sp-bib-cite",
	HIDDEN_CLASS: "sp-bib-hidden",
	ABSENT_CLASS: "sp-bib-absent",
	EMPTY_CLASS: "sp-bib-empty"
}, Ki = { patch: (e) => {} };
function qi(e = {}) {
	let t = Object.assign({}, Ki, e);
	return {
		name: "bib-compactor",
		activate(e) {
			let n = [...Qi];
			t.patch(n), document.querySelectorAll("template[data-sp-cache=\"biblio.html\"]").forEach((e) => {
				let t = Array.from(e.content.children[0].querySelectorAll("li")).map((e) => e.textContent), r = e.innerHTML;
				for (let [e, t] of n) r = typeof e == "string" ? r.replace(RegExp(e + "([ ,.])", "g"), t + "$1") : r.replace(e, t);
				e.innerHTML = r, t.forEach((t, n) => {
					e.content.children[0].querySelectorAll("li")[n].setAttribute("title", t);
				});
			});
		}
	};
}
function Ji(e = {}) {
	let t = Object.assign({}, Gi, e);
	return {
		name: "bib-filtering",
		activate(e) {
			e.addSlideRefinement({
				appliesTo: (e) => e.querySelector(t.BIB_SELECTOR) !== null,
				apply: (e) => {
					Xi(t, e);
				}
			});
		}
	};
}
function Yi(e) {
	return e.closest(".sp-anim-hidden, .sp-anim-only") === null;
}
function Xi(e, t) {
	let n = t.querySelectorAll(e.BIB_SELECTOR);
	if (n.length === 0) return;
	let r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
	t.querySelectorAll(e.CITE_SELECTOR).forEach((e) => {
		let t = e.getAttribute("href");
		if (!t?.startsWith("#")) return;
		let n = t.slice(1);
		r.add(n), Yi(e) && i.add(n);
	}), n.forEach((t) => Zi(e, t, i, r));
}
function Zi(e, t, n, r) {
	let i = 0;
	t.querySelectorAll("li").forEach((t) => {
		let a = t.getAttribute("id");
		a !== null && n.has(a) ? (t.classList.remove(e.HIDDEN_CLASS, e.ABSENT_CLASS), i++) : (t.classList.add(e.HIDDEN_CLASS), t.classList.toggle(e.ABSENT_CLASS, a === null || !r.has(a)));
	}), t.classList.toggle(e.EMPTY_CLASS, i === 0);
}
var Qi = [
	[
		"IEEE Transactions on Pattern Analysis and Machine Intelligence",
		"TPAMI",
		"venue"
	],
	[
		"Association for the Advancement of Artificial Intelligence",
		"AAAI",
		"venue"
	],
	[
		"International Joint Conference on Artificial Intelligence",
		"IJCAI",
		"venue"
	],
	[
		"Conference on Computer Vision and Pattern Recognition",
		"CVPR",
		"venue"
	],
	[
		"International Conference on Learning Representations",
		"ICLR",
		"venue"
	],
	[
		"Advances in Neural Information Processing Systems",
		"NeurIPS",
		"venue"
	],
	[
		"International Conference on Machine Learning",
		"ICML",
		"venue"
	],
	[
		"European Conference on Machine Learning",
		"ECML",
		"venue"
	],
	[
		"European Conference on Computer Vision",
		"ECCV",
		"venue"
	],
	[
		"Neural Information Processing Systems",
		"NeurIPS",
		"venue"
	],
	[
		"Journal of Machine Learning Research",
		"JMLR",
		"venue"
	],
	[
		"Artificial Intelligence",
		"AI",
		"word"
	],
	[
		"Proceedings of the",
		"Proc.",
		"word"
	],
	[
		"Transactions",
		"Trans.",
		"word"
	],
	[
		"Conference",
		"Conf.",
		"word"
	],
	[
		"International",
		"Int.",
		"word"
	],
	[
		"Applications",
		"Appl.",
		"word"
	],
	[
		"Mathematical",
		"Math.",
		"word"
	],
	[
		"Engineering",
		"Eng.",
		"word"
	],
	[
		"Letters on",
		"Lett.",
		"word"
	],
	[
		"National",
		"Nat.",
		"word"
	],
	[
		"Physical",
		"Phys.",
		"word"
	],
	[
		"Academy",
		"Acad.",
		"word"
	]
];
//#endregion
//#region src/plugins/mathPlugins.ts
function $i() {
	return {
		name: "math-token-class",
		activate(e) {
			e.addSlideRefinement({
				appliesTo(e) {
					return !!e.querySelector("math mtext");
				},
				apply(e) {
					e.querySelectorAll("mtext").forEach((e) => {
						let t = e.textContent?.trim() ?? "";
						if (!t.startsWith("class:")) return;
						let n = t.replace(/^class: */, "");
						e.style.fontSize = "0", e.setAttribute("class", n);
					});
				}
			});
		}
	};
}
//#endregion
//#region src/plugins/plugins.ts
function ea(e) {
	switch (e) {
		case "default": return [
			Ji(),
			qi(),
			$i()
		];
		default: throw Error(`Unknown plugin set: ${e}`);
	}
}
//#endregion
//#region src/core.ts
var ta = {
	"sp-alternatives": ai,
	"sp-anim": oi,
	"sp-drag": pi,
	"sp-img": gi,
	"sp-include": Hi,
	"sp-svg": Ni,
	"sp-step": _i,
	"sp-style": vi,
	"sp-toc": wi,
	"sp-slide-source": Li,
	"sp-bib": Wi
};
function na(e) {
	return typeof e == "string" ? document.querySelector(e) : e ?? null;
}
function ra(e) {
	if (e.tagName === "TEMPLATE") {
		let t = document.createElement("div");
		return t.append(e.content.cloneNode(!0)), t.innerHTML;
	}
	return e.textContent || "";
}
function ia(e) {
	let t = e.trim();
	if (!t) return {};
	try {
		let e = JSON.parse(t);
		if (e && typeof e == "object" && !Array.isArray(e)) return {
			config: e.config,
			css: e.css,
			js: e.js,
			jsMounted: e["js-mounted"] ?? e.jsMounted
		};
	} catch {
		console.warn("sp-init: could not parse payload", e.slice(0, 80));
	}
	return {};
}
function aa(e) {
	if (!e || !e.trim()) return;
	let t = document.createElement("script");
	t.textContent = e, (document.head ?? document.documentElement).appendChild(t), t.remove();
}
function oa(e) {
	if (!e || !e.trim()) return;
	let t = document.createElement("style");
	t.textContent = e, document.head.appendChild(t), B.add(t);
}
function sa(e) {
	let t = document.documentElement;
	Array.from(t.classList).filter((e) => e.startsWith("theme-")).forEach((e) => t.classList.remove(e)), t.classList.add("theme-" + e.replace(/[^a-zA-Z0-9_-]/g, ""));
}
function ca(e) {
	let t = document.documentElement;
	e.forEach((e) => e.startsWith("!") ? t.classList.remove(e.substring(1)) : t.classList.add(e));
}
function la(e) {
	if (!e || typeof e != "object") return;
	let t = document.documentElement.style;
	for (let [n, r] of Object.entries(e)) {
		if (r === void 0) continue;
		let e = n.startsWith("--") ? n : `--${n.startsWith("sp-") ? "" : "sp-"}${n}`;
		r === null ? t.removeProperty(e) : t.setProperty(e, String(r));
	}
}
function ua() {
	let e = document.getElementById("sp-presentation");
	if (!e) return {};
	let t = {}, n = (t) => {
		let n = e.getAttribute(t);
		return n ? parseInt(n, 10) : void 0;
	}, r = n("data-design-width"), i = n("data-design-height");
	r !== void 0 && i !== void 0 && (t.designWidth = r, t.designHeight = i);
	let a = e.getAttribute("data-author");
	a !== null && (t.author = a);
	let o = n("data-seed");
	o !== void 0 && (t.seed = o);
	let s = e.getAttribute("data-theme");
	s !== null && s && (t.theme = s);
	let c = e.getAttribute("data-transition");
	c !== null && c && (t.transition = c);
	let l = n("data-transition-duration");
	l !== void 0 && (t.transitionDuration = l);
	let u = e.getAttribute("data-presenter");
	u !== null && (t.presenter = u === "" || u === "true" || u === "1");
	let d = e.getAttribute("data-sp-init");
	if (d) try {
		let e = JSON.parse(d);
		e && typeof e == "object" && !Array.isArray(e) && Object.assign(t, e);
	} catch {
		console.warn("sp-init: could not parse data-sp-init attribute on #sp-presentation");
	}
	return t;
}
async function da(e = {}) {
	let t = document.getElementById("sp-init"), n = t ? ia(ra(t)) : {};
	aa(n.js), oa(n.css);
	let i = {
		...ua(),
		...n.config ?? {},
		...e
	}, { el: a, transition: o, transitionDuration: s, designWidth: c, designHeight: l, author: u, components: d, seed: f, cacheIgnore: p, plugins: m, activate: g, theme: _, variants: v, presenter: y } = i, b = i.slides;
	_ && sa(String(_)), v && ca(typeof v == "string" ? v.split(" ") : v);
	let x = i["tab-title"] || i.tabTitle || i.title;
	x && (document.title = String(x)), la(i["css-vars"] ?? i.cssVars);
	let S = [...m ?? ea("default")];
	if (g) {
		let e = g;
		typeof g == "string" && (e = Function("api", g)), S.unshift({
			name: "__user__",
			order: 100,
			activate: e
		});
	}
	let C = S.sort((e, t) => (e.order ?? 0) - (t.order ?? 0));
	for (let e of C) await U.register(e);
	let w = document.getElementById("sp-content"), E = document.getElementById("sp-cache"), D = {}, O = null, k = [];
	if (w) {
		let e = await Y(w.textContent || "");
		gn.value = e, k.push(...ce(e));
		let t = Oe(De(Ee(e)));
		O = document.createElement("div"), O.innerHTML = t;
	}
	if (!b) {
		if (E?.content) {
			let e = E.content.textContent?.trim();
			e && Ye(e);
		}
		O && (b = se(O), o && b.forEach((e) => {
			e.transition === "" && (e.transition = o);
		}));
	}
	O && oe(O, D);
	let A = document.getElementById("sp-chunklets");
	if (A?.tagName === "SCRIPT") {
		let e = A.textContent || "";
		e.trim() && (z.chunkletDefs = At(e));
	}
	document.querySelectorAll("template[data-sp-cache]").forEach((e) => {
		let t = e.getAttribute("data-sp-cache"), n = ra(e).trim();
		t && n && (We(t).value = n);
	});
	let j = [];
	function M(e) {
		Array.from(e.children).forEach((e) => {
			if (["sp-style", "style"].includes(e.tagName.toLowerCase())) {
				let t = e.getAttribute("css") ?? e.textContent?.trim();
				if (!t) return;
				let n = document.createElement("style");
				n.textContent = t, document.head.appendChild(n), j.push(n), B.add(n);
			}
		});
	}
	function ee() {
		j.forEach((e) => e.remove()), j = [];
	}
	function te(e) {
		ee();
		let t = document.createElement("div");
		t.innerHTML = e, M(t);
	}
	if (p && Ve(p), O) {
		M(O);
		let e = [];
		O.querySelectorAll("sp-include").forEach((t) => {
			let n = t.getAttribute("src");
			n && e.push(Ke(n));
		});
		let t = /* @__PURE__ */ new Set();
		O.querySelectorAll("img[src]").forEach((e) => {
			let n = e.getAttribute("src");
			n && !n.startsWith("data:") && !n.startsWith("blob:") && t.add(n);
		}), O.querySelectorAll("sp-img[src]").forEach((e) => {
			let n = e.getAttribute("src");
			n && !n.startsWith("data:") && !n.startsWith("blob:") && t.add(n);
		}), t.forEach((t) => {
			t.match(/\.svg(\?|#|$)/i) ? e.push(Ke(t)) : e.push(qe(t));
		}), await Promise.all(e);
	}
	let N = {
		...ta,
		...d
	}, ne = na(a) ?? document.getElementById("sp-presentation") ?? document.getElementById("app") ?? document.body, re = new URLSearchParams(window.location.search), P = y ?? re.has("presenter");
	Object.assign(ue, {
		transition: o,
		transitionDuration: s,
		designWidth: c,
		designHeight: l,
		author: u,
		seed: f,
		theme: _,
		raw: D,
		el: "#app"
	});
	function F(e) {
		return window.location.search.match(`[?]${e}($|[?])`);
	}
	let ie = F("print") ? F("steps") ? "steps" : "slides" : !1, I = r(ii, {
		slides: b,
		rawSlideSources: k,
		transition: o,
		transitionDuration: s,
		designWidth: c,
		designHeight: l,
		author: u,
		seed: f,
		raw: D,
		components: N,
		presenter: P,
		print: ie
	});
	I.config.globalProperties.$sp = z, I.provide("sp-api", z), I.provide("sp-registry", U);
	let L = T(0);
	I.provide("liveUpdatesCount", L), typeof globalThis < "u" && (globalThis.__sp__ = z);
	let R = I.mount(ne);
	if (aa(n.jsMounted), I.use = async (e) => (await U.register(e), R.rebuildKeymap(), I), typeof EventSource < "u") {
		let e = new EventSource("/__sp_events"), t = (e) => {
			let t = 0;
			for (let n of e) t = (t << 5) - t + n.charCodeAt(0), t |= 0;
			return t;
		}, n = parseInt(window.localStorage.getItem("sp-non-content-hash") ?? "0", 10);
		e.addEventListener("update", (e) => {
			L.value++;
			let r = (e.data ?? "").trim();
			r ? Qe(r) : Ze();
			let i = window.location.href.substring(0, window.location.href.length - window.location.hash.length);
			fetch(i + "?_=" + Date.now()).then((e) => e.text()).then((e) => {
				let r = t(e.replace(/<script\s+type="text\/html"\s+id="sp-content">[\s\S]*?<\/script>/, ""));
				if (n !== 0 && n !== r) {
					window.localStorage.setItem("sp-non-content-hash", r.toString());
					try {
						sessionStorage.setItem("sp-live-overview", z.overview ? "1" : "0");
					} catch {}
					Rt(!0), window.location.reload();
					return;
				}
				n = r;
				let i = e.match(/<script\s+type="text\/html"\s+id="sp-content">([\s\S]*?)<\/script>/);
				i && (async () => {
					let e = await Y(i[1]);
					Ce(), R.updateSlides?.(e), te(e), await h(), Rt();
				})().catch(() => {});
			}).catch(() => {});
		}), e.addEventListener("connected", () => {
			z.devServer = !0;
		}, { once: !0 }), e.addEventListener("typst-error", (e) => {
			Ce();
			try {
				let t = JSON.parse(e.data ?? "{}"), n = document.querySelector("#sp-presentation")?.getAttribute("data-sp-filepath"), r = [];
				if (Array.isArray(t)) r = t;
				else if (t && typeof t == "object") {
					let e = t, i = n ? e[n] : null;
					r = Array.isArray(i) ? i : n ? [] : Object.values(e);
				}
				for (let e of r) typeof e == "string" && e && Se(e);
			} catch {}
		});
	}
	return I.export = Ar, I;
}
//#endregion
export { ai as SpAlternatives, oi as SpAnim, Wi as SpBib, pi as SpDrag, gi as SpImg, Hi as SpInclude, ii as SpPresentation, jn as SpSlide, Li as SpSlideSource, vi as SpStyle, Ni as SpSvg, wi as SpToc, Oi as addViewBox, vt as bind, Nt as chunkPlacementMode, yt as createDefaultKeymap, da as createSlidesPurryst, Mi as defaultTransformers, xe as definePlugin, Ar as exportStandalone, Ai as idRewrite, be as injectStyle, ye as listAnimActionTypes, _e as listAnimCommands, Fe as maybeProcessed, V as parseArgs, jt as parseChunklets, At as parseChunkletsFromText, se as parseElementToSlides, Ne as processSlideHtml, ve as registerAnimActionType, ge as registerAnimCommand, U as registry, Ot as resetConfig, z as spApi, ji as styleToAttributes, Mt as substituteParams, $n as useElementScale, _t as useKeymap, bt as useNavigation, xt as usePresenter, St as useScale, yi as useSlideTree, le as useSlides, Pe as useSteps, Dt as useStorage, ki as xlinkRewrite };
