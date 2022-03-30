export declare const Traits: {
    node: {
        id: import("./types_typed").Type<import("./types_typed").Optional<string>, string | null>;
        classes: import("./types_typed").Type<import("./types_typed").Optional<string | string[]>, string[]>;
    };
    entity: {
        active: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
    };
    object: {
        visible: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
    };
    unit: {
        scale: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        fov: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        focus: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    span: {
        range: import("./types_typed").Type<unknown, unknown>;
    };
    view: {
        range: import("./types_typed").Type<unknown[], unknown[]>;
    };
    view3: {
        position: any;
        quaternion: any;
        rotation: any;
        scale: any;
        eulerOrder: import("./types_typed").Type<import("./types_typed").Optional<string | import("./types_typed").Axes[]>, number[]>;
    };
    view4: {
        position: any;
        scale: any;
    };
    layer: {
        depth: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        fit: any;
    };
    vertex: {
        pass: any;
    };
    fragment: {
        pass: any;
        gamma: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
    };
    transform3: {
        position: any;
        quaternion: any;
        rotation: any;
        eulerOrder: import("./types_typed").Type<import("./types_typed").Optional<string | import("./types_typed").Axes[]>, number[]>;
        scale: any;
        matrix: any;
    };
    transform4: {
        position: any;
        scale: any;
        matrix: any;
    };
    camera: {
        proxy: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        position: import("./types_typed").Type<unknown, unknown>;
        quaternion: import("./types_typed").Type<unknown, unknown>;
        rotation: import("./types_typed").Type<unknown, unknown>;
        lookAt: import("./types_typed").Type<unknown, unknown>;
        up: import("./types_typed").Type<unknown, unknown>;
        eulerOrder: import("./types_typed").Type<import("./types_typed").Optional<string | import("./types_typed").Axes[]>, number[]>;
        fov: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
    };
    polar: {
        bend: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        helix: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    spherical: {
        bend: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    stereographic: {
        bend: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    interval: {
        axis: import("./types_typed").Type<import("./types_typed").Optional<import("./types_typed").Axes>, number>;
    };
    area: {
        axes: import("./types_typed").Type<import("./types_typed").Optional<string | import("./types_typed").Axes[]>, number[]>;
    };
    volume: {
        axes: import("./types_typed").Type<import("./types_typed").Optional<string | import("./types_typed").Axes[]>, number[]>;
    };
    origin: {
        origin: any;
    };
    scale: {
        divide: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        unit: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        base: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        mode: any;
        start: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        end: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        zero: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        factor: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        nice: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
    };
    grid: {
        lineX: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        lineY: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        crossed: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        closedX: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        closedY: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
    };
    axis: {
        detail: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        crossed: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
    };
    data: {
        data: import("./types_typed").Type<unknown, unknown>;
        expr: import("./types_typed").Type<unknown, unknown>;
        bind: import("./types_typed").Type<unknown, unknown>;
        live: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
    };
    buffer: {
        channels: import("./types_typed").Type<import("./types_typed").Optional<1 | 2 | 3 | 4>, 1 | 2 | 3 | 4>;
        items: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        fps: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        hurry: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        limit: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        realtime: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        observe: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        aligned: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
    };
    sampler: {
        centered: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        padding: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    array: {
        width: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        bufferWidth: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        history: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    matrix: {
        width: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        height: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        history: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        bufferWidth: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        bufferHeight: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    voxel: {
        width: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        height: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        depth: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        bufferWidth: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        bufferHeight: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        bufferDepth: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    resolve: {
        expr: import("./types_typed").Type<unknown, unknown>;
        items: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    style: {
        opacity: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        color: any;
        blending: import("./types_typed").Type<import("./types_typed").Optional<import("./types_typed").BlendingModes>, import("./types_typed").BlendingModes>;
        zWrite: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        zTest: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        zIndex: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        zBias: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        zOrder: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
    };
    geometry: {
        points: import("./types_typed").Type<import("./types_typed").Optional<string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>, string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>;
        colors: import("./types_typed").Type<import("./types_typed").Optional<string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>, string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props> | null>;
    };
    point: {
        size: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        sizes: import("./types_typed").Type<import("./types_typed").Optional<string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>, string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props> | null>;
        shape: any;
        optical: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        fill: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        depth: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    line: {
        width: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        depth: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        join: any;
        stroke: any;
        proximity: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        closed: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
    };
    mesh: {
        fill: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        shaded: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        map: import("./types_typed").Type<import("./types_typed").Optional<string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>, string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props> | null>;
        lineBias: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    strip: {
        line: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
    };
    face: {
        line: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
    };
    arrow: {
        size: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        start: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        end: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
    };
    ticks: {
        normal: any;
        size: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        epsilon: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    attach: {
        offset: any;
        snap: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        depth: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    format: {
        digits: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        data: import("./types_typed").Type<unknown, unknown>;
        expr: import("./types_typed").Type<unknown, unknown>;
        live: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
    };
    font: {
        font: any;
        style: import("./types_typed").Type<import("./types_typed").Optional<string>, string>;
        variant: import("./types_typed").Type<import("./types_typed").Optional<string>, string>;
        weight: import("./types_typed").Type<import("./types_typed").Optional<string>, string>;
        detail: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        sdf: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    label: {
        text: import("./types_typed").Type<import("./types_typed").Optional<string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>, string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>;
        size: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        outline: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        expand: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        background: any;
    };
    overlay: {
        opacity: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        zIndex: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    dom: {
        points: import("./types_typed").Type<import("./types_typed").Optional<string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>, string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>;
        html: import("./types_typed").Type<import("./types_typed").Optional<string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>, string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>;
        size: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        outline: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        zoom: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        color: import("./types_typed").Type<unknown, unknown>;
        attributes: import("./types_typed").Type<unknown, unknown>;
        pointerEvents: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
    };
    texture: {
        minFilter: any;
        magFilter: any;
        type: any;
    };
    shader: {
        sources: import("./types_typed").Type<import("./types_typed").Optional<string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>, string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props> | null>;
        language: import("./types_typed").Type<import("./types_typed").Optional<string>, string>;
        code: import("./types_typed").Type<import("./types_typed").Optional<string>, string>;
        uniforms: import("./types_typed").Type<unknown, unknown>;
    };
    include: {
        shader: import("./types_typed").Type<import("./types_typed").Optional<string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>, string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>;
    };
    operator: {
        source: import("./types_typed").Type<import("./types_typed").Optional<string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>, string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>;
    };
    spread: {
        unit: any;
        items: import("./types_typed").Type<unknown, unknown>;
        width: import("./types_typed").Type<unknown, unknown>;
        height: import("./types_typed").Type<unknown, unknown>;
        depth: import("./types_typed").Type<unknown, unknown>;
        alignItems: import("./types_typed").Type<import("./types_typed").Optional<import("./types_typed").Alignments>, import("./types_typed").Alignments>;
        alignWidth: import("./types_typed").Type<import("./types_typed").Optional<import("./types_typed").Alignments>, import("./types_typed").Alignments>;
        alignHeight: import("./types_typed").Type<import("./types_typed").Optional<import("./types_typed").Alignments>, import("./types_typed").Alignments>;
        alignDepth: import("./types_typed").Type<import("./types_typed").Optional<import("./types_typed").Alignments>, import("./types_typed").Alignments>;
    };
    grow: {
        scale: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        items: import("./types_typed").Type<import("./types_typed").Optional<import("./types_typed").Alignments>, import("./types_typed").Alignments | null>;
        width: import("./types_typed").Type<import("./types_typed").Optional<import("./types_typed").Alignments>, import("./types_typed").Alignments | null>;
        height: import("./types_typed").Type<import("./types_typed").Optional<import("./types_typed").Alignments>, import("./types_typed").Alignments | null>;
        depth: import("./types_typed").Type<import("./types_typed").Optional<import("./types_typed").Alignments>, import("./types_typed").Alignments | null>;
    };
    split: {
        order: import("./types_typed").Type<import("./types_typed").Optional<string | import("./types_typed").Axes[]>, number[]>;
        axis: import("./types_typed").Type<import("./types_typed").Optional<import("./types_typed").Axes>, number | null>;
        length: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        overlap: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    join: {
        order: import("./types_typed").Type<import("./types_typed").Optional<string | import("./types_typed").Axes[]>, number[]>;
        axis: import("./types_typed").Type<import("./types_typed").Optional<import("./types_typed").Axes>, number | null>;
        overlap: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    swizzle: {
        order: import("./types_typed").Type<import("./types_typed").Optional<string | import("./types_typed").Axes[]>, number[]>;
    };
    transpose: {
        order: import("./types_typed").Type<import("./types_typed").Optional<string | import("./types_typed").Axes[]>, number[]>;
    };
    repeat: {
        items: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        width: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        height: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        depth: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    slice: {
        items: import("./types_typed").Type<unknown, unknown>;
        width: import("./types_typed").Type<unknown, unknown>;
        height: import("./types_typed").Type<unknown, unknown>;
        depth: import("./types_typed").Type<unknown, unknown>;
    };
    lerp: {
        size: any;
        items: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        width: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        height: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        depth: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
    };
    subdivide: {
        items: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        width: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        height: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        depth: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        bevel: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        lerp: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
    };
    resample: {
        indices: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        channels: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        sample: any;
        size: any;
        items: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        width: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        height: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        depth: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
    };
    readback: {
        type: any;
        expr: import("./types_typed").Type<unknown, unknown>;
        data: any;
        channels: import("./types_typed").Type<import("./types_typed").Optional<1 | 2 | 3 | 4>, 1 | 2 | 3 | 4>;
        items: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        width: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        height: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        depth: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
    };
    root: {
        speed: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        camera: import("./types_typed").Type<import("./types_typed").Optional<string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>, string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>;
    };
    inherit: {
        source: import("./types_typed").Type<import("./types_typed").Optional<string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>, string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>;
        traits: import("./types_typed").Type<import("./types_typed").Optional<string>[], string[]>;
    };
    rtt: {
        size: any;
        width: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        height: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        history: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    compose: {
        alpha: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
    };
    present: {
        index: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        directed: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        length: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    slide: {
        order: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        steps: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        early: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        late: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        from: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        to: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
    };
    transition: {
        stagger: any;
        enter: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        exit: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        delay: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        delayEnter: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        delayExit: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        duration: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        durationEnter: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        durationExit: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
    };
    move: {
        from: any;
        to: any;
    };
    seek: {
        seek: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
    };
    track: {
        target: import("./types_typed").Type<import("./types_typed").Optional<string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>, string | import("../..").MathboxNode<keyof import("../..").Props> | import("../..").MathboxSelection<keyof import("../..").Props>>;
        script: any;
        ease: any;
    };
    trigger: {
        trigger: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
    step: {
        playback: any;
        stops: import("./types_typed").Type<import("./types_typed").Optional<number>[] | null, number[] | null>;
        delay: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        duration: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        pace: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        speed: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        rewind: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        skip: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        realtime: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
    };
    play: {
        delay: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        pace: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        speed: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        from: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        to: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        realtime: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
        loop: import("./types_typed").Type<import("./types_typed").Optional<boolean>, boolean>;
    };
    now: {
        now: import("./types_typed").Type<unknown, unknown>;
        seek: import("./types_typed").Type<import("./types_typed").Optional<number>, number | null>;
        pace: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
        speed: import("./types_typed").Type<import("./types_typed").Optional<number>, number>;
    };
};
