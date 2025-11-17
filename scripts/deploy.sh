#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
IMAGE_NAME=${IMAGE_NAME:-variables-backend}
IMAGE_TAG=${IMAGE_TAG:-latest}
REGISTRY=${REGISTRY:-}
IMAGE_REF="${REGISTRY:+${REGISTRY}/}${IMAGE_NAME}:${IMAGE_TAG}"

echo "[deploy] Building image ${IMAGE_REF}"
docker build -t "${IMAGE_REF}" "${ROOT_DIR}"

echo "[deploy] Image built: ${IMAGE_REF}"

if [[ "${PUSH_ON_BUILD:-false}" == "true" ]]; then
  echo "[deploy] Pushing ${IMAGE_REF}"
  docker push "${IMAGE_REF}"
fi

if [[ "${RUN_CONTAINER:-false}" == "true" ]]; then
  PORT=${PORT:-3000}
  echo "[deploy] Restarting container ${IMAGE_NAME} on port ${PORT}"
  docker rm -f "${IMAGE_NAME}" >/dev/null 2>&1 || true
  docker run -d --name "${IMAGE_NAME}" -p "${PORT}:3000" "${IMAGE_REF}"
fi
