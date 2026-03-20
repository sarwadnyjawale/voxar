(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/hanu/components/dashboard/DashHeader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hanu/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hanu/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hanu/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function DashHeader({ breadcrumbs, planLabel = 'Pro Plan' }) {
    _s();
    const [showProfileMenu, setShowProfileMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "dash-header",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "header-left",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "header-breadcrumb",
                        children: breadcrumbs.map((crumb, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    i > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "breadcrumb-sep",
                                        children: "/"
                                    }, void 0, false, {
                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                        lineNumber: 20,
                                        columnNumber: 25
                                    }, this),
                                    crumb.href ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: crumb.href,
                                        className: "breadcrumb-segment",
                                        children: crumb.label
                                    }, void 0, false, {
                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                        lineNumber: 22,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `breadcrumb-segment ${i === breadcrumbs.length - 1 ? 'current' : ''}`,
                                        children: crumb.label
                                    }, void 0, false, {
                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                        lineNumber: 24,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                lineNumber: 19,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                        lineNumber: 17,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "header-project-tag",
                        children: [
                            "● ",
                            planLabel
                        ]
                    }, void 0, true, {
                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                        lineNumber: 29,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "header-right",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "header-btn",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "14",
                                height: "14",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                        cx: "12",
                                        cy: "12",
                                        r: "10"
                                    }, void 0, false, {
                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                        lineNumber: 33,
                                        columnNumber: 154
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
                                    }, void 0, false, {
                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                        lineNumber: 33,
                                        columnNumber: 187
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: "12",
                                        y1: "17",
                                        x2: "12.01",
                                        y2: "17"
                                    }, void 0, false, {
                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                        lineNumber: 33,
                                        columnNumber: 236
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                lineNumber: 33,
                                columnNumber: 11
                            }, this),
                            "Help"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "header-divider"
                    }, void 0, false, {
                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "header-notif",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "16",
                                height: "16",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                                    }, void 0, false, {
                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                        lineNumber: 38,
                                        columnNumber: 154
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M13.73 21a2 2 0 0 1-3.46 0"
                                    }, void 0, false, {
                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                        lineNumber: 38,
                                        columnNumber: 210
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                lineNumber: 38,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "notif-dot"
                            }, void 0, false, {
                                fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                lineNumber: 39,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "header-profile-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "header-avatar",
                                onClick: ()=>setShowProfileMenu(!showProfileMenu),
                                children: "VK"
                            }, void 0, false, {
                                fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this),
                            showProfileMenu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "profile-dropdown",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "profile-dropdown-header",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "profile-dropdown-avatar",
                                                children: "VK"
                                            }, void 0, false, {
                                                fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                                lineNumber: 46,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "profile-dropdown-name",
                                                        children: "Voxar User"
                                                    }, void 0, false, {
                                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                                        lineNumber: 48,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "profile-dropdown-email",
                                                        children: "user@voxar.ai"
                                                    }, void 0, false, {
                                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                                        lineNumber: 49,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                                lineNumber: 47,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                        lineNumber: 45,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "profile-dropdown-divider"
                                    }, void 0, false, {
                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                        lineNumber: 52,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        className: "profile-dropdown-item",
                                        href: "/dashboard/settings",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                width: "14",
                                                height: "14",
                                                viewBox: "0 0 24 24",
                                                fill: "none",
                                                stroke: "currentColor",
                                                strokeWidth: "2",
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                                        lineNumber: 54,
                                                        columnNumber: 160
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                        cx: "12",
                                                        cy: "7",
                                                        r: "4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                                        lineNumber: 54,
                                                        columnNumber: 214
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                                lineNumber: 54,
                                                columnNumber: 17
                                            }, this),
                                            "Account"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                        lineNumber: 53,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        className: "profile-dropdown-item",
                                        href: "#",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                width: "14",
                                                height: "14",
                                                viewBox: "0 0 24 24",
                                                fill: "none",
                                                stroke: "currentColor",
                                                strokeWidth: "2",
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                                    points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                                                }, void 0, false, {
                                                    fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                                    lineNumber: 58,
                                                    columnNumber: 160
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                                lineNumber: 58,
                                                columnNumber: 17
                                            }, this),
                                            "Plan",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "profile-plan-badge",
                                                children: "Pro"
                                            }, void 0, false, {
                                                fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                                lineNumber: 60,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                        lineNumber: 57,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "profile-dropdown-divider"
                                    }, void 0, false, {
                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                        lineNumber: 62,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        className: "profile-dropdown-item profile-dropdown-logout",
                                        href: "/",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                width: "14",
                                                height: "14",
                                                viewBox: "0 0 24 24",
                                                fill: "none",
                                                stroke: "currentColor",
                                                strokeWidth: "2",
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                                        lineNumber: 64,
                                                        columnNumber: 160
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                        points: "16 17 21 12 16 7"
                                                    }, void 0, false, {
                                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                                        lineNumber: 64,
                                                        columnNumber: 212
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                        x1: "21",
                                                        y1: "12",
                                                        x2: "9",
                                                        y2: "12"
                                                    }, void 0, false, {
                                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                                        lineNumber: 64,
                                                        columnNumber: 250
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                                lineNumber: 64,
                                                columnNumber: 17
                                            }, this),
                                            "Logout"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                        lineNumber: 63,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                                lineNumber: 44,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/hanu/components/dashboard/DashHeader.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_s(DashHeader, "fTgDfqGyF1WBl3FqHEf4oUGt+zg=");
_c = DashHeader;
var _c;
__turbopack_context__.k.register(_c, "DashHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hanu/stores/studioStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useStudioStore",
    ()=>useStudioStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hanu/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hanu/lib/api.ts [app-client] (ecmascript)");
;
;
let blockCounter = 0;
let abortGenerateAll = false;
let lastUsedVoiceId = 'v011';
let lastUsedVoiceName = 'Arjun';
function makeId() {
    return `sb-${++blockCounter}-${Date.now()}`;
}
function createBlock(text = '', voiceId = 'v011', voiceName = 'Arjun', engine = 'flash', language = 'auto', speed = 1.0) {
    return {
        id: makeId(),
        text,
        voiceId,
        voiceName,
        engine,
        language,
        speed,
        audioUrl: null,
        duration: 0,
        status: 'idle',
        error: null,
        dirty: true
    };
}
const useStudioStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        projectName: 'Untitled Project',
        blocks: [
            createBlock('Welcome to VOXAR Studio. This is your advanced workspace for creating multi-voice audio productions.'),
            createBlock('Each block represents a speech segment. You can assign different voices to each block.', 'v011', 'Arjun', 'flash', 'auto', 1.0),
            createBlock('Use the timeline below to preview your entire project as a seamless audio experience.', 'v011', 'Arjun', 'flash', 'auto', 1.0)
        ],
        activeBlockId: null,
        format: 'mp3',
        enhance: false,
        normalize: true,
        volume: 80,
        isGeneratingAll: false,
        generatingBlockId: null,
        generationProgress: null,
        isPlaying: false,
        currentPlayBlockIdx: -1,
        audioElement: null,
        setProjectName: (name)=>set({
                projectName: name
            }),
        setActiveBlock: (id)=>set({
                activeBlockId: id
            }),
        setFormat: (f)=>set({
                format: f
            }),
        setEnhance: (v)=>set({
                enhance: v
            }),
        setNormalize: (v)=>set({
                normalize: v
            }),
        setVolume: (v)=>{
            set({
                volume: v
            });
            const { audioElement } = get();
            if (audioElement) audioElement.volume = v / 100;
        },
        addBlock: (voiceId, voiceName)=>{
            const vid = voiceId || lastUsedVoiceId;
            const vname = voiceName || lastUsedVoiceName;
            const block = createBlock('', vid, vname);
            set((s)=>({
                    blocks: [
                        ...s.blocks,
                        block
                    ],
                    activeBlockId: block.id
                }));
            return block.id;
        },
        deleteBlock: (id)=>{
            const { blocks, activeBlockId } = get();
            if (blocks.length <= 1) return;
            set({
                blocks: blocks.filter((b)=>b.id !== id),
                activeBlockId: activeBlockId === id ? null : activeBlockId
            });
        },
        duplicateBlock: (id)=>{
            const { blocks } = get();
            const idx = blocks.findIndex((b)=>b.id === id);
            if (idx === -1) return;
            const src = blocks[idx];
            const dup = createBlock(src.text, src.voiceId, src.voiceName, src.engine, src.language, src.speed);
            const next = [
                ...blocks
            ];
            next.splice(idx + 1, 0, dup);
            set({
                blocks: next
            });
        },
        updateBlockText: (id, text)=>{
            set((s)=>({
                    blocks: s.blocks.map((b)=>b.id === id ? {
                            ...b,
                            text,
                            dirty: true
                        } : b)
                }));
        },
        updateBlockSettings: (id, settings)=>{
            if (settings.voiceId) lastUsedVoiceId = settings.voiceId;
            if (settings.voiceName) lastUsedVoiceName = settings.voiceName;
            set((s)=>({
                    blocks: s.blocks.map((b)=>b.id === id ? {
                            ...b,
                            ...settings,
                            dirty: true
                        } : b)
                }));
        },
        generateBlock: async (id)=>{
            const { blocks, format, enhance, normalize } = get();
            const block = blocks.find((b)=>b.id === id);
            if (!block || !block.text.trim()) return;
            // Mark generating
            set((s)=>({
                    generatingBlockId: id,
                    blocks: s.blocks.map((b)=>b.id === id ? {
                            ...b,
                            status: 'generating',
                            error: null
                        } : b)
                }));
            try {
                const result = await __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].backendPost('/api/v1/tts/generate', {
                    text: block.text.trim(),
                    voice: block.voiceId,
                    engine: block.engine,
                    language: block.language,
                    speed: block.speed,
                    format,
                    enhance,
                    normalize
                });
                set((s)=>({
                        generatingBlockId: null,
                        blocks: s.blocks.map((b)=>b.id === id ? {
                                ...b,
                                audioUrl: result.audio_url,
                                duration: result.duration || 0,
                                status: 'done',
                                error: null,
                                dirty: false
                            } : b)
                    }));
            } catch (err) {
                set((s)=>({
                        generatingBlockId: null,
                        blocks: s.blocks.map((b)=>b.id === id ? {
                                ...b,
                                status: 'error',
                                error: err.message || 'Generation failed'
                            } : b)
                    }));
            }
        },
        generateAll: async ()=>{
            const { blocks } = get();
            const pending = blocks.filter((b)=>b.text.trim() && (b.dirty || b.status !== 'done'));
            if (pending.length === 0) return;
            abortGenerateAll = false;
            set({
                isGeneratingAll: true,
                generationProgress: {
                    current: 0,
                    total: pending.length
                }
            });
            for(let i = 0; i < pending.length; i++){
                if (abortGenerateAll) break;
                set({
                    generationProgress: {
                        current: i + 1,
                        total: pending.length
                    }
                });
                await get().generateBlock(pending[i].id);
            }
            set({
                isGeneratingAll: false,
                generationProgress: null
            });
        },
        stopGenerateAll: ()=>{
            abortGenerateAll = true;
        },
        playBlock: (id)=>{
            const { blocks, volume } = get();
            const block = blocks.find((b)=>b.id === id);
            if (!block?.audioUrl) return;
            // Stop any existing playback
            get().stopPlayback();
            const audio = new Audio(block.audioUrl);
            audio.volume = volume / 100;
            audio.onended = ()=>set({
                    isPlaying: false,
                    audioElement: null,
                    currentPlayBlockIdx: -1
                });
            audio.onerror = ()=>set({
                    isPlaying: false,
                    audioElement: null,
                    currentPlayBlockIdx: -1
                });
            audio.play().catch(()=>{});
            const idx = blocks.findIndex((b)=>b.id === id);
            set({
                isPlaying: true,
                audioElement: audio,
                currentPlayBlockIdx: idx,
                activeBlockId: id
            });
        },
        playAll: ()=>{
            const { blocks, volume } = get();
            const withAudio = blocks.filter((b)=>b.audioUrl);
            if (withAudio.length === 0) return;
            get().stopPlayback();
            let currentIdx = 0;
            function playNext() {
                if (currentIdx >= withAudio.length) {
                    set({
                        isPlaying: false,
                        audioElement: null,
                        currentPlayBlockIdx: -1
                    });
                    return;
                }
                const block = withAudio[currentIdx];
                const globalIdx = blocks.findIndex((b)=>b.id === block.id);
                const audio = new Audio(block.audioUrl);
                audio.volume = volume / 100;
                audio.onended = ()=>{
                    currentIdx++;
                    playNext();
                };
                audio.onerror = ()=>{
                    currentIdx++;
                    playNext();
                };
                audio.play().catch(()=>{});
                set({
                    audioElement: audio,
                    currentPlayBlockIdx: globalIdx,
                    activeBlockId: block.id
                });
            }
            set({
                isPlaying: true
            });
            playNext();
        },
        stopPlayback: ()=>{
            const { audioElement } = get();
            if (audioElement) {
                audioElement.pause();
                audioElement.src = '';
            }
            set({
                isPlaying: false,
                audioElement: null,
                currentPlayBlockIdx: -1
            });
        }
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hanu/stores/voiceStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useVoiceStore",
    ()=>useVoiceStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hanu/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hanu/lib/api.ts [app-client] (ecmascript)");
;
;
const FAVORITES_KEY = 'voxar-favorite-voices';
function loadFavorites() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    } catch  {
        return [];
    }
}
function saveFavorites(ids) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}
const useVoiceStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        voices: [],
        clonedVoices: [],
        isLoading: false,
        error: null,
        searchQuery: '',
        filters: {
            tags: []
        },
        favorites: loadFavorites(),
        fetchVoices: async ()=>{
            set({
                isLoading: true,
                error: null
            });
            try {
                const data = await __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].backendGet('/api/v1/voices/catalog');
                const voices = Array.isArray(data) ? data : data.voices || [];
                set({
                    voices,
                    isLoading: false
                });
            } catch (err) {
                set({
                    error: err.message || 'Failed to fetch voices',
                    isLoading: false
                });
            }
        },
        fetchClonedVoices: async ()=>{
            try {
                const data = await __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].backendGet('/api/v1/voices/my');
                set({
                    clonedVoices: data.voices || []
                });
            } catch  {
            // Silently fail for cloned voices
            }
        },
        setSearchQuery: (query)=>set({
                searchQuery: query
            }),
        toggleTagFilter: (tag)=>set((state)=>{
                const tags = state.filters.tags.includes(tag) ? state.filters.tags.filter((t)=>t !== tag) : [
                    ...state.filters.tags,
                    tag
                ];
                return {
                    filters: {
                        ...state.filters,
                        tags
                    }
                };
            }),
        playPreview: (id)=>{
            const previewText = 'Welcome to VOXAR. This is a preview of this voice.';
            __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].backendPost('/api/v1/tts/generate', {
                text: previewText,
                voice: id,
                engine: 'flash',
                language: 'en',
                format: 'mp3'
            }).then((result)=>{
                if (result.audio_url) {
                    const audio = new Audio(result.audio_url);
                    audio.play().catch(()=>{});
                }
            }).catch((err)=>{
                console.warn('Voice preview failed:', err.message);
            });
        },
        toggleFavorite: (id)=>{
            const { favorites } = get();
            const next = favorites.includes(id) ? favorites.filter((f)=>f !== id) : [
                ...favorites,
                id
            ];
            saveFavorites(next);
            set({
                favorites: next
            });
        },
        isFavorite: (id)=>{
            return get().favorites.includes(id);
        }
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hanu/app/dashboard/studio/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StudioPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hanu/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hanu/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$components$2f$dashboard$2f$DashHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hanu/components/dashboard/DashHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$stores$2f$studioStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hanu/stores/studioStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$stores$2f$voiceStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hanu/stores/voiceStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function StudioPage() {
    _s();
    const { projectName, setProjectName, blocks, activeBlockId, setActiveBlock, format, setFormat, enhance, setEnhance, normalize, setNormalize, volume, setVolume, addBlock, deleteBlock, duplicateBlock, updateBlockText, updateBlockSettings, generateBlock, generateAll, stopGenerateAll, isGeneratingAll, generatingBlockId, generationProgress, playBlock, playAll, stopPlayback, isPlaying, currentPlayBlockIdx, audioElement } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$stores$2f$studioStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStudioStore"])();
    const { voices, clonedVoices, fetchVoices, fetchClonedVoices } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$stores$2f$voiceStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useVoiceStore"])();
    const [voiceDropdownBlockId, setVoiceDropdownBlockId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const volumeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Fetch real voices on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StudioPage.useEffect": ()=>{
            fetchVoices();
            fetchClonedVoices();
        }
    }["StudioPage.useEffect"], [
        fetchVoices,
        fetchClonedVoices
    ]);
    // All available voices (catalog + cloned)
    const allVoices = [
        ...voices.map((v)=>({
                id: v.id,
                name: v.display_name || v.name,
                type: 'catalog',
                lang: v.primary_language || v.languages?.[0]
            })),
        ...clonedVoices.filter((v)=>v.status === 'ready').map((v)=>({
                id: v._id,
                name: `${v.name} (Clone)`,
                type: 'cloned',
                lang: v.language
            }))
    ];
    const totalDuration = blocks.reduce((sum, b)=>sum + b.duration, 0);
    const totalChars = blocks.reduce((sum, b)=>sum + b.text.trim().length, 0);
    const pendingCount = blocks.filter((b)=>b.text.trim() && (b.dirty || b.status !== 'done')).length;
    const handleVolumeClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "StudioPage.useCallback[handleVolumeClick]": (e)=>{
            if (!volumeRef.current) return;
            const rect = volumeRef.current.getBoundingClientRect();
            const pct = Math.max(0, Math.min(100, Math.round((e.clientX - rect.left) / rect.width * 100)));
            setVolume(pct);
        }
    }["StudioPage.useCallback[handleVolumeClick]"], [
        setVolume
    ]);
    const formatTime = (seconds)=>{
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };
    const getVoiceColor = (voiceId)=>{
        // Generate a consistent color from voice ID
        const colors = [
            'linear-gradient(135deg,#ff6b6b,#ee5a24)',
            'linear-gradient(135deg,#a29bfe,#6c5ce7)',
            'linear-gradient(135deg,#00cec9,#0984e3)',
            'linear-gradient(135deg,#fd79a8,#e84393)',
            'linear-gradient(135deg,#f9ca24,#f0932b)',
            'linear-gradient(135deg,#55efc4,#00b894)',
            'linear-gradient(135deg,#74b9ff,#0984e3)',
            'linear-gradient(135deg,#e17055,#d63031)'
        ];
        let hash = 0;
        for(let i = 0; i < voiceId.length; i++)hash = (hash << 5) - hash + voiceId.charCodeAt(i) | 0;
        return colors[Math.abs(hash) % colors.length];
    };
    const selectVoice = (blockId, voiceId, voiceName)=>{
        updateBlockSettings(blockId, {
            voiceId,
            voiceName
        });
        setVoiceDropdownBlockId(null);
    };
    // Close dropdown on outside click
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StudioPage.useEffect": ()=>{
            if (!voiceDropdownBlockId) return;
            const close = {
                "StudioPage.useEffect.close": ()=>setVoiceDropdownBlockId(null)
            }["StudioPage.useEffect.close"];
            window.addEventListener('click', close);
            return ({
                "StudioPage.useEffect": ()=>window.removeEventListener('click', close)
            })["StudioPage.useEffect"];
        }
    }["StudioPage.useEffect"], [
        voiceDropdownBlockId
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$components$2f$dashboard$2f$DashHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                breadcrumbs: [
                    {
                        label: 'Studio'
                    },
                    {
                        label: 'Editor'
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "studio-layout",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "studio-left",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "studio-left-header",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "studio-left-title",
                                    children: "Controls"
                                }, void 0, false, {
                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                    lineNumber: 108,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "studio-left-body",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "studio-left-section",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "studio-left-section-title",
                                                children: "Playback"
                                            }, void 0, false, {
                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                lineNumber: 113,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "control-group",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "slider-control",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "slider-header",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "slider-label",
                                                                    children: "Volume"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                    lineNumber: 117,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "slider-value",
                                                                    children: [
                                                                        volume,
                                                                        "%"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                    lineNumber: 118,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                            lineNumber: 116,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "slider-track",
                                                            ref: volumeRef,
                                                            onClick: handleVolumeClick,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "slider-fill",
                                                                    style: {
                                                                        width: `${volume}%`
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                    lineNumber: 121,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "slider-thumb",
                                                                    style: {
                                                                        left: `${volume}%`
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                    lineNumber: 122,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                            lineNumber: 120,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                    lineNumber: 115,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                lineNumber: 114,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                        lineNumber: 112,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "controls-divider"
                                    }, void 0, false, {
                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                        lineNumber: 128,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "studio-left-section",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "studio-left-section-title",
                                                children: "Output Format"
                                            }, void 0, false, {
                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                lineNumber: 132,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "format-options",
                                                children: [
                                                    'mp3',
                                                    'wav'
                                                ].map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: `format-chip ${f === format ? 'active' : ''}`,
                                                        onClick: ()=>setFormat(f),
                                                        children: f.toUpperCase()
                                                    }, f, false, {
                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                        lineNumber: 135,
                                                        columnNumber: 19
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                lineNumber: 133,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                        lineNumber: 131,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "controls-divider"
                                    }, void 0, false, {
                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                        lineNumber: 146,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "studio-left-section",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "studio-left-section-title",
                                                children: "AI Tools"
                                            }, void 0, false, {
                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                lineNumber: 150,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "toggle-control",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "toggle-info",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "toggle-label",
                                                                children: "Audio Enhancement"
                                                            }, void 0, false, {
                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                lineNumber: 153,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "toggle-desc",
                                                                children: "Denoise & clarity boost"
                                                            }, void 0, false, {
                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                lineNumber: 154,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                        lineNumber: 152,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `toggle-switch ${enhance ? 'active' : ''}`,
                                                        onClick: ()=>setEnhance(!enhance),
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "toggle-knob"
                                                        }, void 0, false, {
                                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                            lineNumber: 157,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                        lineNumber: 156,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                lineNumber: 151,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "toggle-control",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "toggle-info",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "toggle-label",
                                                                children: "Loudness Normalize"
                                                            }, void 0, false, {
                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                lineNumber: 162,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "toggle-desc",
                                                                children: "Consistent volume"
                                                            }, void 0, false, {
                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                lineNumber: 163,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                        lineNumber: 161,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `toggle-switch ${normalize ? 'active' : ''}`,
                                                        onClick: ()=>setNormalize(!normalize),
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "toggle-knob"
                                                        }, void 0, false, {
                                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                            lineNumber: 166,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                        lineNumber: 165,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                lineNumber: 160,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                        lineNumber: 149,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "controls-divider"
                                    }, void 0, false, {
                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                        lineNumber: 171,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "studio-left-section",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "studio-left-section-title",
                                                children: "Project Stats"
                                            }, void 0, false, {
                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                lineNumber: 175,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '11px',
                                                    color: 'var(--text-muted)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '6px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "Blocks"
                                                            }, void 0, false, {
                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                lineNumber: 178,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    color: 'var(--text-secondary)'
                                                                },
                                                                children: blocks.length
                                                            }, void 0, false, {
                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                lineNumber: 178,
                                                                columnNumber: 38
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                        lineNumber: 177,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "Characters"
                                                            }, void 0, false, {
                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                lineNumber: 181,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    color: 'var(--text-secondary)'
                                                                },
                                                                children: totalChars.toLocaleString()
                                                            }, void 0, false, {
                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                lineNumber: 181,
                                                                columnNumber: 42
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                        lineNumber: 180,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "Duration"
                                                            }, void 0, false, {
                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                lineNumber: 184,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    color: 'var(--text-secondary)'
                                                                },
                                                                children: formatTime(totalDuration)
                                                            }, void 0, false, {
                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                lineNumber: 184,
                                                                columnNumber: 40
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                        lineNumber: 183,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "Pending"
                                                            }, void 0, false, {
                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                lineNumber: 187,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    color: pendingCount > 0 ? 'var(--text-primary)' : 'var(--text-dim)'
                                                                },
                                                                children: pendingCount
                                                            }, void 0, false, {
                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                lineNumber: 187,
                                                                columnNumber: 39
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                        lineNumber: 186,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                lineNumber: 176,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                        lineNumber: 174,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                lineNumber: 110,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                        lineNumber: 106,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "studio-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "studio-toolbar",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "studio-toolbar-left",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                className: "studio-project-name",
                                                value: projectName,
                                                onChange: (e)=>setProjectName(e.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                lineNumber: 198,
                                                columnNumber: 15
                                            }, this),
                                            isGeneratingAll && generationProgress && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "studio-project-status",
                                                style: {
                                                    color: 'var(--accent-light)'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "studio-project-dot",
                                                        style: {
                                                            background: 'var(--accent)',
                                                            animation: 'pulse 1s infinite'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                        lineNumber: 206,
                                                        columnNumber: 19
                                                    }, this),
                                                    "Generating ",
                                                    generationProgress.current,
                                                    "/",
                                                    generationProgress.total
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                lineNumber: 205,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                        lineNumber: 197,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "studio-toolbar-right",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "char-count",
                                                children: [
                                                    blocks.length,
                                                    " blocks · ",
                                                    totalChars.toLocaleString(),
                                                    " chars"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                lineNumber: 212,
                                                columnNumber: 15
                                            }, this),
                                            isGeneratingAll ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn-secondary-action",
                                                style: {
                                                    padding: '8px 20px',
                                                    fontSize: '12px'
                                                },
                                                onClick: stopGenerateAll,
                                                children: "Stop"
                                            }, void 0, false, {
                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                lineNumber: 214,
                                                columnNumber: 17
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn-generate",
                                                style: {
                                                    padding: '8px 20px',
                                                    fontSize: '12px'
                                                },
                                                onClick: ()=>generateAll(),
                                                disabled: pendingCount === 0,
                                                children: pendingCount > 0 ? `Generate ${pendingCount > 1 ? `All (${pendingCount})` : ''}` : 'All Generated'
                                            }, void 0, false, {
                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                lineNumber: 222,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                        lineNumber: 211,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                lineNumber: 196,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "studio-blocks",
                                children: [
                                    blocks.map((block, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `studio-block ${activeBlockId === block.id ? 'active' : ''} ${block.status === 'generating' ? 'generating' : ''}`,
                                            onClick: ()=>setActiveBlock(block.id),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "studio-block-voice",
                                                    style: {
                                                        position: 'relative'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "studio-block-avatar",
                                                            style: {
                                                                background: getVoiceColor(block.voiceId)
                                                            },
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                setVoiceDropdownBlockId(voiceDropdownBlockId === block.id ? null : block.id);
                                                            },
                                                            title: "Click to change voice",
                                                            children: block.voiceName[0]
                                                        }, void 0, false, {
                                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                            lineNumber: 244,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "studio-block-voice-name",
                                                            children: block.voiceName
                                                        }, void 0, false, {
                                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                            lineNumber: 255,
                                                            columnNumber: 19
                                                        }, this),
                                                        voiceDropdownBlockId === block.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "studio-voice-dropdown",
                                                            onClick: (e)=>e.stopPropagation(),
                                                            style: {
                                                                position: 'absolute',
                                                                top: '100%',
                                                                left: 0,
                                                                zIndex: 100,
                                                                width: '220px',
                                                                maxHeight: '240px',
                                                                overflowY: 'auto',
                                                                background: 'var(--bg-secondary)',
                                                                border: '1px solid var(--border)',
                                                                borderRadius: 'var(--radius-md)',
                                                                boxShadow: 'var(--shadow-lg)',
                                                                padding: '4px',
                                                                marginTop: '4px'
                                                            },
                                                            children: [
                                                                allVoices.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        padding: '12px',
                                                                        fontSize: '11px',
                                                                        color: 'var(--text-dim)',
                                                                        textAlign: 'center'
                                                                    },
                                                                    children: "Loading voices..."
                                                                }, void 0, false, {
                                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                    lineNumber: 279,
                                                                    columnNumber: 25
                                                                }, this),
                                                                allVoices.map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>selectVoice(block.id, v.id, v.name),
                                                                        style: {
                                                                            width: '100%',
                                                                            padding: '8px 10px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '8px',
                                                                            background: v.id === block.voiceId ? 'var(--bg-glass-hover)' : 'transparent',
                                                                            border: 'none',
                                                                            borderRadius: 'var(--radius-sm)',
                                                                            color: 'var(--text-primary)',
                                                                            fontSize: '12px',
                                                                            cursor: 'pointer',
                                                                            textAlign: 'left',
                                                                            transition: 'background 0.15s'
                                                                        },
                                                                        onMouseEnter: (e)=>e.currentTarget.style.background = 'var(--bg-glass-hover)',
                                                                        onMouseLeave: (e)=>e.currentTarget.style.background = v.id === block.voiceId ? 'var(--bg-glass-hover)' : 'transparent',
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                style: {
                                                                                    width: '24px',
                                                                                    height: '24px',
                                                                                    borderRadius: '50%',
                                                                                    background: getVoiceColor(v.id),
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    fontSize: '10px',
                                                                                    fontWeight: 700,
                                                                                    color: '#fff',
                                                                                    flexShrink: 0
                                                                                },
                                                                                children: v.name[0]
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                                lineNumber: 305,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                style: {
                                                                                    flex: 1,
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                    whiteSpace: 'nowrap'
                                                                                },
                                                                                children: v.name
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                                lineNumber: 315,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            v.type === 'cloned' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                style: {
                                                                                    fontSize: '9px',
                                                                                    color: 'var(--accent-light)',
                                                                                    background: 'var(--accent-glow)',
                                                                                    padding: '1px 5px',
                                                                                    borderRadius: '4px'
                                                                                },
                                                                                children: "CLONE"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                                lineNumber: 319,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            v.lang && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                style: {
                                                                                    fontSize: '9px',
                                                                                    color: 'var(--text-dim)',
                                                                                    textTransform: 'uppercase'
                                                                                },
                                                                                children: v.lang
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                                lineNumber: 324,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, v.id, true, {
                                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                        lineNumber: 284,
                                                                        columnNumber: 25
                                                                    }, this))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                            lineNumber: 259,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                    lineNumber: 243,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        gap: '6px',
                                                        alignItems: 'center',
                                                        flexShrink: 0
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            className: "model-select",
                                                            value: block.engine,
                                                            onChange: (e)=>{
                                                                e.stopPropagation();
                                                                updateBlockSettings(block.id, {
                                                                    engine: e.target.value
                                                                });
                                                            },
                                                            style: {
                                                                padding: '3px 6px',
                                                                fontSize: '10px',
                                                                width: 'auto',
                                                                minWidth: '80px'
                                                            },
                                                            onClick: (e)=>e.stopPropagation(),
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "flash",
                                                                    children: "Flash"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                    lineNumber: 343,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "cinematic",
                                                                    children: "Cinematic"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                    lineNumber: 344,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "longform",
                                                                    children: "Longform"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                    lineNumber: 345,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "multilingual",
                                                                    children: "Multilingual"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                    lineNumber: 346,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                            lineNumber: 336,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            className: "model-select",
                                                            value: block.language,
                                                            onChange: (e)=>{
                                                                e.stopPropagation();
                                                                updateBlockSettings(block.id, {
                                                                    language: e.target.value
                                                                });
                                                            },
                                                            style: {
                                                                padding: '3px 6px',
                                                                fontSize: '10px',
                                                                width: 'auto',
                                                                minWidth: '60px'
                                                            },
                                                            onClick: (e)=>e.stopPropagation(),
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "auto",
                                                                    children: "Auto"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                    lineNumber: 355,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "en",
                                                                    children: "EN"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                    lineNumber: 356,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "hi",
                                                                    children: "HI"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                    lineNumber: 357,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "hinglish",
                                                                    children: "Hinglish"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                    lineNumber: 358,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "ta",
                                                                    children: "Tamil"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                    lineNumber: 359,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "te",
                                                                    children: "Telugu"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                    lineNumber: 360,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "bn",
                                                                    children: "Bengali"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                    lineNumber: 361,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                            lineNumber: 348,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            className: "model-select",
                                                            value: String(block.speed),
                                                            onChange: (e)=>{
                                                                e.stopPropagation();
                                                                updateBlockSettings(block.id, {
                                                                    speed: parseFloat(e.target.value)
                                                                });
                                                            },
                                                            style: {
                                                                padding: '3px 6px',
                                                                fontSize: '10px',
                                                                width: 'auto',
                                                                minWidth: '55px'
                                                            },
                                                            onClick: (e)=>e.stopPropagation(),
                                                            children: [
                                                                0.5,
                                                                0.75,
                                                                1.0,
                                                                1.25,
                                                                1.5,
                                                                2.0
                                                            ].map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: String(s),
                                                                    children: [
                                                                        s,
                                                                        "x"
                                                                    ]
                                                                }, s, true, {
                                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                    lineNumber: 371,
                                                                    columnNumber: 23
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                            lineNumber: 363,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                    lineNumber: 335,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "studio-block-content",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        className: "studio-block-text",
                                                        value: block.text,
                                                        onChange: (e)=>updateBlockText(block.id, e.target.value),
                                                        placeholder: "Type your text here...",
                                                        rows: Math.max(1, Math.ceil(block.text.length / 80))
                                                    }, void 0, false, {
                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                        lineNumber: 378,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                    lineNumber: 377,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "studio-block-actions",
                                                    children: [
                                                        block.status === 'generating' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '9px',
                                                                color: 'var(--accent-light)',
                                                                marginRight: '4px'
                                                            },
                                                            children: "Generating..."
                                                        }, void 0, false, {
                                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                            lineNumber: 391,
                                                            columnNumber: 21
                                                        }, this),
                                                        block.status === 'done' && !block.dirty && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '9px',
                                                                color: 'var(--success)',
                                                                marginRight: '4px'
                                                            },
                                                            children: "Ready"
                                                        }, void 0, false, {
                                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                            lineNumber: 394,
                                                            columnNumber: 21
                                                        }, this),
                                                        block.status === 'done' && block.dirty && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '9px',
                                                                color: 'var(--text-muted)',
                                                                marginRight: '4px'
                                                            },
                                                            children: "Modified"
                                                        }, void 0, false, {
                                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                            lineNumber: 397,
                                                            columnNumber: 21
                                                        }, this),
                                                        block.status === 'error' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '9px',
                                                                color: '#ef4444',
                                                                marginRight: '4px'
                                                            },
                                                            title: block.error || '',
                                                            children: "Error"
                                                        }, void 0, false, {
                                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                            lineNumber: 400,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            className: "studio-block-btn",
                                                            title: block.audioUrl ? 'Play block' : 'Generate first',
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                if (block.audioUrl) playBlock(block.id);
                                                            },
                                                            style: {
                                                                opacity: block.audioUrl ? 1 : 0.3
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                width: "10",
                                                                height: "10",
                                                                viewBox: "0 0 24 24",
                                                                fill: "none",
                                                                stroke: "currentColor",
                                                                strokeWidth: "2",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                                                    points: "5 3 19 12 5 21 5 3"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                    lineNumber: 410,
                                                                    columnNumber: 119
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                lineNumber: 410,
                                                                columnNumber: 21
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                            lineNumber: 404,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            className: "studio-block-btn",
                                                            title: block.status === 'done' ? 'Regenerate' : 'Generate',
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                generateBlock(block.id);
                                                            },
                                                            style: {
                                                                opacity: block.status === 'generating' ? 0.3 : 1
                                                            },
                                                            children: block.status === 'generating' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                width: "10",
                                                                height: "10",
                                                                viewBox: "0 0 24 24",
                                                                fill: "none",
                                                                stroke: "currentColor",
                                                                strokeWidth: "2",
                                                                style: {
                                                                    animation: 'loginSpin 1s linear infinite'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                                        points: "1 4 1 10 7 10"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                        lineNumber: 421,
                                                                        columnNumber: 175
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        d: "M3.51 15a9 9 0 1 0 2.13-9.36L1 10"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                        lineNumber: 421,
                                                                        columnNumber: 210
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                lineNumber: 421,
                                                                columnNumber: 23
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                width: "10",
                                                                height: "10",
                                                                viewBox: "0 0 24 24",
                                                                fill: "none",
                                                                stroke: "currentColor",
                                                                strokeWidth: "2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                                        points: "1 4 1 10 7 10"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                        lineNumber: 423,
                                                                        columnNumber: 121
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        d: "M3.51 15a9 9 0 1 0 2.13-9.36L1 10"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                        lineNumber: 423,
                                                                        columnNumber: 156
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                lineNumber: 423,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                            lineNumber: 414,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            className: "studio-block-btn",
                                                            title: "Duplicate",
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                duplicateBlock(block.id);
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                width: "10",
                                                                height: "10",
                                                                viewBox: "0 0 24 24",
                                                                fill: "none",
                                                                stroke: "currentColor",
                                                                strokeWidth: "2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                                        x: "9",
                                                                        y: "9",
                                                                        width: "13",
                                                                        height: "13",
                                                                        rx: "2"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                        lineNumber: 429,
                                                                        columnNumber: 119
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                        lineNumber: 429,
                                                                        columnNumber: 169
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                lineNumber: 429,
                                                                columnNumber: 21
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                            lineNumber: 428,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            className: "studio-block-btn studio-block-btn--danger",
                                                            title: "Delete",
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                deleteBlock(block.id);
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                width: "10",
                                                                height: "10",
                                                                viewBox: "0 0 24 24",
                                                                fill: "none",
                                                                stroke: "currentColor",
                                                                strokeWidth: "2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                                        points: "3 6 5 6 21 6"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                        lineNumber: 434,
                                                                        columnNumber: 119
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                        lineNumber: 434,
                                                                        columnNumber: 153
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                                lineNumber: 434,
                                                                columnNumber: 21
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                            lineNumber: 433,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                    lineNumber: 388,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, block.id, true, {
                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                            lineNumber: 237,
                                            columnNumber: 15
                                        }, this)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "studio-add-block",
                                        onClick: ()=>{
                                            const newId = addBlock();
                                            setVoiceDropdownBlockId(newId);
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                width: "14",
                                                height: "14",
                                                viewBox: "0 0 24 24",
                                                fill: "none",
                                                stroke: "currentColor",
                                                strokeWidth: "2",
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                        x1: "12",
                                                        y1: "5",
                                                        x2: "12",
                                                        y2: "19"
                                                    }, void 0, false, {
                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                        lineNumber: 444,
                                                        columnNumber: 158
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                        x1: "5",
                                                        y1: "12",
                                                        x2: "19",
                                                        y2: "12"
                                                    }, void 0, false, {
                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                        lineNumber: 444,
                                                        columnNumber: 197
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                lineNumber: 444,
                                                columnNumber: 15
                                            }, this),
                                            "Add Speech Block"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                        lineNumber: 440,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                lineNumber: 235,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "studio-timeline",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "studio-timeline-controls",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "studio-timeline-play",
                                            onClick: ()=>{
                                                if (isPlaying) {
                                                    stopPlayback();
                                                } else {
                                                    playAll();
                                                }
                                            },
                                            style: {
                                                opacity: blocks.some((b)=>b.audioUrl) ? 1 : 0.3
                                            },
                                            children: isPlaying ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                width: "12",
                                                height: "12",
                                                viewBox: "0 0 24 24",
                                                fill: "none",
                                                stroke: "currentColor",
                                                strokeWidth: "2.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                        x1: "6",
                                                        y1: "4",
                                                        x2: "6",
                                                        y2: "20"
                                                    }, void 0, false, {
                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                        lineNumber: 460,
                                                        columnNumber: 119
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                        x1: "18",
                                                        y1: "4",
                                                        x2: "18",
                                                        y2: "20"
                                                    }, void 0, false, {
                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                        lineNumber: 460,
                                                        columnNumber: 156
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                lineNumber: 460,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                width: "12",
                                                height: "12",
                                                viewBox: "0 0 24 24",
                                                fill: "none",
                                                stroke: "currentColor",
                                                strokeWidth: "2",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                                    points: "5 3 19 12 5 21 5 3"
                                                }, void 0, false, {
                                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                    lineNumber: 462,
                                                    columnNumber: 117
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                lineNumber: 462,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                            lineNumber: 452,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "studio-timeline-track",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "studio-timeline-segments",
                                                children: blocks.map((block)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `studio-timeline-seg ${activeBlockId === block.id ? 'active' : ''}`,
                                                        style: {
                                                            flex: block.duration > 0 ? block.duration : Math.max(1, Math.ceil(block.text.split(/\s+/).filter(Boolean).length * 0.4)),
                                                            opacity: block.audioUrl ? 1 : 0.4
                                                        },
                                                        onClick: ()=>{
                                                            setActiveBlock(block.id);
                                                            if (block.audioUrl) playBlock(block.id);
                                                        },
                                                        children: block.voiceName.substring(0, 6)
                                                    }, block.id, false, {
                                                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                        lineNumber: 468,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                                lineNumber: 466,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                            lineNumber: 465,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "studio-timeline-time",
                                            children: formatTime(totalDuration)
                                        }, void 0, false, {
                                            fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                            lineNumber: 485,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                    lineNumber: 451,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                                lineNumber: 450,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                        lineNumber: 195,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/hanu/app/dashboard/studio/page.tsx",
                lineNumber: 104,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(StudioPage, "OteA+7mvNYsf4tNa+so708ajNOw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$stores$2f$studioStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStudioStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hanu$2f$stores$2f$voiceStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useVoiceStore"]
    ];
});
_c = StudioPage;
var _c;
__turbopack_context__.k.register(_c, "StudioPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=hanu_a0641ba3._.js.map