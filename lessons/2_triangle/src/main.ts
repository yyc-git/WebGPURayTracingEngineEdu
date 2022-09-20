// TODO move out to .wgsl(need wgsl loader for webpack)
const vertexShaderWGSL = `
@vertex
fn main(@builtin(vertex_index) VertexIndex : u32)
     -> @builtin(position) vec4<f32> {
  var pos = array<vec2<f32>, 3>(
      vec2<f32>(0.0, 0.5),
      vec2<f32>(-0.5, -0.5),
      vec2<f32>(0.5, -0.5));

  return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
}
    `;

const fragmentShaderWGSL = `
@fragment
fn main() -> @location(0) vec4<f32> {
  return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}
    `;


function _getAndInitCanvas() {
  let canvas = document.querySelector("#webgpu") as HTMLCanvasElement

  canvas.width = 600;
  canvas.style.width = "600px";
  canvas.height = 600;
  canvas.style.height = "600px";

  return canvas
}

const init = async (canvas) => {
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();

  // if (canvas === null) return;
  const context = canvas.getContext('webgpu');

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();


  context.configure({
    device,
    format: presentationFormat,
    alphaMode: "premultiplied"
  });

  const pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [] }),
    vertex: {
      module: device.createShaderModule({
        code: vertexShaderWGSL,
      }),
      entryPoint: 'main',
    },
    fragment: {
      module: device.createShaderModule({
        code: fragmentShaderWGSL,
      }),
      entryPoint: 'main',
      targets: [
        {
          format: presentationFormat,
        },
      ],
    },
    primitive: {
      topology: 'triangle-list',
    },
  });

  function frame() {
    // if (!canvas) return;

    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.draw(3, 1, 0, 0);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
};

init(_getAndInitCanvas()).then(() => {
  console.log("finish ");
});