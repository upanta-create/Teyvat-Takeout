{{/*
Expand the name of the chart.
*/}}
{{- define "teyvat-takeout.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "teyvat-takeout.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "teyvat-takeout.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels applied to all resources
*/}}
{{- define "teyvat-takeout.labels" -}}
helm.sh/chart: {{ include "teyvat-takeout.chart" . }}
{{ include "teyvat-takeout.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: teyvat-takeout
{{- end }}

{{/*
Selector labels for the release
*/}}
{{- define "teyvat-takeout.selectorLabels" -}}
app.kubernetes.io/name: {{ include "teyvat-takeout.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Backend component selector labels
*/}}
{{- define "teyvat-takeout.backend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "teyvat-takeout.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: backend
tier: api
{{- end }}

{{/*
Frontend component selector labels
*/}}
{{- define "teyvat-takeout.frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "teyvat-takeout.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: frontend
tier: presentation
{{- end }}

{{/*
Admin component selector labels
*/}}
{{- define "teyvat-takeout.admin.selectorLabels" -}}
app.kubernetes.io/name: {{ include "teyvat-takeout.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: admin
tier: admin-portal
{{- end }}

{{/*
Redis component selector labels
*/}}
{{- define "teyvat-takeout.redis.selectorLabels" -}}
app.kubernetes.io/name: {{ include "teyvat-takeout.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: redis
tier: cache
{{- end }}

{{/*
MongoDB component selector labels
*/}}
{{- define "teyvat-takeout.mongodb.selectorLabels" -}}
app.kubernetes.io/name: {{ include "teyvat-takeout.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: mongodb
tier: database
{{- end }}
