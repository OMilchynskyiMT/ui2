import type { RouteRecordRaw } from 'vue-router'

// This route tree is loaded only by the demo build.
export const routes: RouteRecordRaw[] = [
  { path: '/', redirect: { name: 'demo-dashboard' } },
  { path: '/demo', redirect: { name: 'demo-dashboard' } },
  {
    path: '/demo/application',
    name: 'demo-home',
    component: () => import('@/demo/layouts/DashboardLayout.vue'),
    redirect: { name: 'demo-dashboard' },
    children: [
      {
        path: 'dashboard',
        name: 'demo-dashboard',
        component: () => import('@/demo/views/application/MainView.vue'),
        meta: {
          title: 'Dashboard',
        },
      },
      {
        path: 'setup',
        name: 'demo-setup',
        meta: { title: 'Setup', breadcrumb: { to: false } },
        children: [
          {
            path: 'wan',
            name: 'demo-wan',
            component: () => import('@/demo/views/application/WanView.vue'),
            meta: { title: 'WAN' },
          },
          {
            path: 'dhcp',
            name: 'demo-dhcp',
            component: () => import('@/demo/views/application/dhcp/BaseView.vue'),
            redirect: { name: 'demo-dhcp-config' },
            meta: { title: 'DHCP' },
            children: [
              {
                path: 'configuration',
                name: 'demo-dhcp-config',
                component: () => import('@/demo/views/application/dhcp/ConfigView.vue'),
                meta: { breadcrumb: 'Configuration', title: 'DHCP Configuration' },
              },
              {
                path: 'new-ipv4',
                name: 'demo-dhcp-add',
                component: () => import('@/demo/views/application/dhcp/AddIpv4View.vue'),
                meta: { breadcrumb: 'New IPv4', title: 'Add IPv4 DHCP Server' },
              },
              {
                path: 'new-ipv6',
                name: 'demo-dhcp-add-v6',
                component: () => import('@/demo/views/application/dhcp/AddIpv6View.vue'),
                meta: { breadcrumb: 'New IPv6', title: 'Add DHCPv6/RA' },
              },
            ],
          },
          {
            path: 'smtp',
            name: 'demo-smtp',
            component: () => import('@/demo/views/application/smtp/BaseView.vue'),
            redirect: { name: 'demo-smtp-settings' },
            meta: { title: 'SMTP' },
            children: [
              {
                path: 'configuration',
                name: 'demo-smtp-settings',
                component: () => import('@/demo/views/application/smtp/SettingsView.vue'),
                meta: { breadcrumb: 'Configuration', title: 'SMTP Configuration' },
              },
              {
                path: 'log',
                name: 'demo-smtp-log',
                component: () => import('@/demo/views/application/smtp/LogView.vue'),
                meta: { breadcrumb: 'Log', title: 'Mail Log' },
              },
            ],
          },
        ],
      },
      {
        path: 'administration',
        name: 'demo-administration',
        meta: { title: 'Administration', breadcrumb: { to: false } },
        children: [
          {
            path: 'debug-options',
            name: 'demo-debug-options',
            component: () => import('@/demo/views/application/DebugOptionsView.vue'),
            meta: { title: 'Debug Options' },
          },
          {
            path: 'usage-policy',
            name: 'demo-usage-policy',
            component: () => import('@/demo/views/application/UsagePolicyView.vue'),
            meta: { title: 'Usage Policy' },
          },
        ],
      },
    ],
  },
  {
    path: '/demo/components',
    component: () => import('@/layouts/BaseLayout.vue'),
    meta: { title: 'Features' },
    children: [
      {
        path: '',
        component: () => import('@/demo/views/ComponentsView.vue'),
        redirect: { name: 'demo-inputs' },
        children: [
          {
            path: 'inputs',
            name: 'demo-inputs',
            component: () => import('@/demo/views/features/InputsView.vue'),
            meta: { title: 'Inputs' },
          },
          {
            path: 'sign-in',
            name: 'demo-sign-in',
            component: () => import('@/demo/views/features/SignInView.vue'),
            meta: { title: 'Sign in' },
          },
          {
            path: 'spinners',
            name: 'demo-spinners',
            component: () => import('@/demo/views/features/SpinnersView.vue'),
            meta: { title: 'Spinners' },
          },
          {
            path: 'buttons',
            name: 'demo-buttons',
            component: () => import('@/demo/views/features/ButtonsView.vue'),
            meta: { title: 'Buttons' },
          },
          {
            path: 'lists',
            name: 'demo-lists',
            component: () => import('@/demo/views/features/ListsView.vue'),
            meta: { title: 'Lists' },
          },
          {
            path: 'chips',
            name: 'demo-chips',
            component: () => import('@/demo/views/features/ChipsView.vue'),
            meta: { title: 'Chips' },
          },
          {
            path: 'dialogs',
            name: 'demo-dialogs',
            component: () => import('@/demo/views/features/DialogsView.vue'),
            meta: { title: 'Dialogs' },
          },
          {
            path: 'menu',
            name: 'demo-menu',
            component: () => import('@/demo/views/features/MenuView.vue'),
            meta: { title: 'Menu' },
          },
          {
            path: 'grid',
            name: 'demo-grid',
            component: () => import('@/demo/views/features/GridView.vue'),
            meta: { title: 'Grid' },
          },
          {
            path: 'certificate',
            name: 'demo-certificate',
            component: () => import('@/demo/views/features/CertificateView.vue'),
            meta: { title: 'Certificate Details' },
          },
          {
            path: 'log-viewer',
            name: 'demo-log-viewer',
            component: () => import('@/demo/views/features/LogViewerView.vue'),
            meta: { title: 'Log Viewer' },
          },
          {
            path: 'code-editor',
            name: 'demo-code-editor',
            component: () => import('@/demo/views/features/CodeEditorView.vue'),
            meta: { title: 'Code editor' },
          },
          {
            path: 'gps',
            name: 'demo-gps',
            component: () => import('@/demo/views/features/GpsView.vue'),
            meta: { title: 'GPS Position' },
          },
          {
            path: 'relative-time',
            name: 'demo-relative-time',
            component: () => import('@/demo/views/features/RelativeTimeView.vue'),
            meta: { title: 'Relative Time' },
          },
          {
            path: 'steps',
            name: 'demo-steps',
            component: () => import('@/demo/views/features/StepsView.vue'),
            meta: { title: 'Steps' },
          },
          {
            path: 'radio-terminal',
            name: 'demo-radio-terminal',
            component: () => import('@/demo/views/features/RadioTerminalView.vue'),
            meta: { title: 'Radio Terminal' },
          },
          {
            path: 'table',
            name: 'demo-table',
            component: () => import('@/demo/views/features/TableView.vue'),
            meta: { title: 'Table' },
          },
          {
            path: 'property-list',
            name: 'demo-property-list',
            component: () => import('@/demo/views/features/PropertyListView.vue'),
            meta: { title: 'Property List' },
          },
          {
            path: 'alerts',
            name: 'demo-alerts',
            component: () => import('@/demo/views/features/AlertsView.vue'),
            meta: { title: 'Alerts' },
          },
          {
            path: 'notifications',
            name: 'demo-notifications',
            component: () => import('@/demo/views/features/NotificationsView.vue'),
            meta: { title: 'Notifications' },
          },
          {
            path: 'navigation',
            name: 'demo-navigation',
            component: () => import('@/demo/views/features/NavigationView.vue'),
            meta: { title: 'Navigation' },
          },
          {
            path: 'mobile',
            name: 'demo-mobile',
            component: () => import('@/demo/views/features/MobileView.vue'),
            meta: { title: 'Mobile Components', breadcrumb: 'Mobile' },
          },
          {
            path: 'bar-chart',
            name: 'demo-bar-chart',
            component: () => import('@/demo/views/features/ChartsView.vue'),
            meta: { title: 'Bar Chart' },
          },
          {
            path: 'dashboard-widgets',
            name: 'demo-dashboard-widgets',
            component: () => import('@/demo/views/features/DashboardWidgetsView.vue'),
            meta: { title: 'Dashboard Widgets' },
          },
        ],
      },
    ],
  },
  // Preserve bookmarks to the component playground from the original showcase.
  { path: '/features/:page?', redirect: to => `/demo/components/${String(to.params.page ?? 'inputs')}` },
]
