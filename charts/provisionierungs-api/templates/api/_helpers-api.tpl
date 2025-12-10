{{- define "vidis-rostering.apiFullname" -}}
{{ include "vidis-rostering.name" . }}-api
{{- end }}

{{- define "vidis-rostering.apiLabels" -}}
{{ include "vidis-rostering.labels" . }}
app.kubernetes.io/component: api
{{- end }}

{{- define "vidis-rostering.apiSelectorLabels" -}}
{{ include "vidis-rostering.selectorLabels" . }}
app.kubernetes.io/component: api
{{- end }}