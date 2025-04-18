//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/~__root'
import { Route as DashboardImport } from './routes/~_dashboard'
import { Route as SigninIndexImport } from './routes/~signin/~index'
import { Route as DashboardIndexImport } from './routes/~_dashboard/~index'
import { Route as DashboardFileFileNameImport } from './routes/~_dashboard/~file/~$fileName'

// Create/Update Routes

const DashboardRoute = DashboardImport.update({
  id: '/_dashboard',
  getParentRoute: () => rootRoute,
} as any)

const SigninIndexRoute = SigninIndexImport.update({
  id: '/signin/',
  path: '/signin/',
  getParentRoute: () => rootRoute,
} as any)

const DashboardIndexRoute = DashboardIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => DashboardRoute,
} as any)

const DashboardFileFileNameRoute = DashboardFileFileNameImport.update({
  id: '/file/$fileName',
  path: '/file/$fileName',
  getParentRoute: () => DashboardRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_dashboard': {
      id: '/_dashboard'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof DashboardImport
      parentRoute: typeof rootRoute
    }
    '/_dashboard/': {
      id: '/_dashboard/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof DashboardIndexImport
      parentRoute: typeof DashboardImport
    }
    '/signin/': {
      id: '/signin/'
      path: '/signin'
      fullPath: '/signin'
      preLoaderRoute: typeof SigninIndexImport
      parentRoute: typeof rootRoute
    }
    '/_dashboard/file/$fileName': {
      id: '/_dashboard/file/$fileName'
      path: '/file/$fileName'
      fullPath: '/file/$fileName'
      preLoaderRoute: typeof DashboardFileFileNameImport
      parentRoute: typeof DashboardImport
    }
  }
}

// Create and export the route tree

interface DashboardRouteChildren {
  DashboardIndexRoute: typeof DashboardIndexRoute
  DashboardFileFileNameRoute: typeof DashboardFileFileNameRoute
}

const DashboardRouteChildren: DashboardRouteChildren = {
  DashboardIndexRoute: DashboardIndexRoute,
  DashboardFileFileNameRoute: DashboardFileFileNameRoute,
}

const DashboardRouteWithChildren = DashboardRoute._addFileChildren(
  DashboardRouteChildren,
)

export interface FileRoutesByFullPath {
  '': typeof DashboardRouteWithChildren
  '/': typeof DashboardIndexRoute
  '/signin': typeof SigninIndexRoute
  '/file/$fileName': typeof DashboardFileFileNameRoute
}

export interface FileRoutesByTo {
  '/': typeof DashboardIndexRoute
  '/signin': typeof SigninIndexRoute
  '/file/$fileName': typeof DashboardFileFileNameRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/_dashboard': typeof DashboardRouteWithChildren
  '/_dashboard/': typeof DashboardIndexRoute
  '/signin/': typeof SigninIndexRoute
  '/_dashboard/file/$fileName': typeof DashboardFileFileNameRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '' | '/' | '/signin' | '/file/$fileName'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/signin' | '/file/$fileName'
  id:
    | '__root__'
    | '/_dashboard'
    | '/_dashboard/'
    | '/signin/'
    | '/_dashboard/file/$fileName'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  DashboardRoute: typeof DashboardRouteWithChildren
  SigninIndexRoute: typeof SigninIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  DashboardRoute: DashboardRouteWithChildren,
  SigninIndexRoute: SigninIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "~__root.tsx",
      "children": [
        "/_dashboard",
        "/signin/"
      ]
    },
    "/_dashboard": {
      "filePath": "~_dashboard.tsx",
      "children": [
        "/_dashboard/",
        "/_dashboard/file/$fileName"
      ]
    },
    "/_dashboard/": {
      "filePath": "~_dashboard/~index.tsx",
      "parent": "/_dashboard"
    },
    "/signin/": {
      "filePath": "~signin/~index.tsx"
    },
    "/_dashboard/file/$fileName": {
      "filePath": "~_dashboard/~file/~$fileName.tsx",
      "parent": "/_dashboard"
    }
  }
}
ROUTE_MANIFEST_END */
