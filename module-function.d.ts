import 'node/node.d'
export as namespace eslafPaint;

export = EslafPaint.EslafPaint;

declare namespace EslafPaint {
    type Image = Buffer;
    type ImageSrc = string | Image;
    type CSSObject = any;

    type ReturnType = {
        [name: string]: Buffer
    }

    type PaintText = {
        type: 'text',
        text: string | Promise<string>,
        use?: string | Promise<string>,
        styles?: CSSObject | Promise<CSSObject>
    }

    type PaintImage = {
        type: 'img',
        src: ImageSrc | Promise<ImageSrc>,
        use?: string | Promise<string>,
        styles?: CSSObject | Promise<CSSObject>
    }

    type cssArg =
        string |
        {type: 'css', data: string};

    type Paint = PaintText | PaintImage

    type profileResolved = {[name: string]: Paint[] | Promise<Paint[]>}
    type profileArg =
        string |
        {type: 'profile', data: profileResolved} |
        ((args) => profileResolved);
    
    type imageArg = string | {type: 'image', data: Buffer}

    function EslafPaint(
        argv: {
            _: [profileArg, cssArg, imageArg],
            [anyArg: string]: any
        },
        stepCallback?: (name: string, image: Buffer) => void
    ): Promise<ReturnType>;
}