async function main() {
  // Obtener la red y la cuenta de despliegue
  const [deployer] = await ethers.getSigners();

  console.log("Desplegando contratos con la cuenta:", deployer.address);

  // Obtener el contrato que deseas desplegar
  const NFTCollection = await ethers.getContractFactory("NFTCollection");

  // Desplegar el contrato
  const nftCollection = await NFTCollection.deploy();

  console.log("Contrato desplegado en:", nftCollection.address);
}

// Ejecutar el script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
