const Docker = require("dockerode");

async function getDesiredInstances() {
  const currentCPUUsage = await getCurrentCPUUsage();
  return Math.ceil(currentCPUUsage / 20);
}

async function getCurrentCPUUsage() {
  return 80;
}

async function main() {
  const docker = new Docker({ socketPath: "/var/run/docker.sock" });

  try {
    const containers = await docker.listContainers();
    const currentInstances = containers.length;
    const desiredInstances = await getDesiredInstances();

    if (currentInstances !== desiredInstances) {
      console.log(
        `Scaling from ${currentInstances} to ${desiredInstances} instances`
      );

      if (currentInstances < desiredInstances) {
        const containersToCreate = desiredInstances - currentInstances;
        for (let i = 0; i < containersToCreate; i++) {
          await createContainer(docker);
        }
      } else {
        const containersToRemove = currentInstances - desiredInstances;
        for (let i = 0; i < containersToRemove; i++) {
          await removeContainer(docker, containers[i].Id);
        }
      }
    }
  } catch (error) {
    console.error("Error during scaling operation:", error);
  }
}

async function createContainer(docker) {
  const container = await docker.createContainer({
    Image: "your-nodejs-app-image",
    Env: ["NODE_ENV=production"],
    ExposedPorts: { "3000/tcp": {} },
    HostConfig: {
      PortBindings: { "3000/tcp": [{ HostPort: "3000" }] },
    },
  });
  await container.start();
}

async function removeContainer(docker, containerId) {
  const container = docker.getContainer(containerId);
  await container.stop();
  await container.remove();
}

main().catch((error) => console.error("Error in main function:", error));
