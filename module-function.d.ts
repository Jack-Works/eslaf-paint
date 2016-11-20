import 'node/node.d'
export as namespace eslafPaint;

export = EslafPaint.EslafPaint;

declare namespace EslafPaint {
    type Image = Buffer;
    type ImageSrc = string | Image;
    type CSSObject = any;

    type CSSArg = string | {type: 'css', data: string} | undefined;
    type ImageArg = string | {type: 'image', data: Buffer} | undefined;

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
    type Paint = PaintText | PaintImage;
    type Profile = {[name: string]: Paint[] | Promise<Paint[]>}
    type ProfileArg =
        string | 
        {type: 'profile', data: Profile} |
        {type: 'profile', data: Promise<Profile>} |
        {type: 'profile', data: (args: any) => Profile} |
        {type: 'profile', data: (args: any) => Promise<Profile>}
    
    type ReturnType = {
        [name: string]: Buffer
    }
    
    function EslafPaint(
        argv: {
            _: [ProfileArg, CSSArg, ImageArg],
            [anyArg: string]: any
        },
        stepCallback?: (name: string, image: Buffer) => void
    ): Promise<ReturnType>;
}